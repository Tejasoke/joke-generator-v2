"""
AI Joke Generator — FastAPI Backend
Fine-tuned GPT-2 Medium (local) served via FastAPI.
"""

import os
import re
import json
import random
import asyncio
from contextlib import asynccontextmanager
from threading import Thread

from pathlib import Path

import torch
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TextIteratorStreamer,
)

# ---------------------------------------------------------------------------
# Paths & Hugging Face Model Repository
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "fine-tuned-gpt2")
# Hugging Face repository: https://huggingface.co/tejasoke/joke-generator-gpt2
HUGGINGFACE_MODEL_ID = os.getenv("HF_MODEL_ID", "tejasoke/joke-generator-gpt2")

# ---------------------------------------------------------------------------
# NSFW filter
# ---------------------------------------------------------------------------
NSFW_KEYWORDS = [
    "sex", "porn", "xxx", "nude", "naked",
    "boobs", "breast", "penis", "vagina",
    "dick", "pussy", "ass", "fuck",
    "bdsm", "horny", "nsfw", "milf",
]
_NSFW_PATTERN = re.compile(
    r"\b(" + "|".join(NSFW_KEYWORDS) + r")\b", re.IGNORECASE
)


def contains_nsfw(text: str) -> bool:
    return bool(_NSFW_PATTERN.search(text))


# ---------------------------------------------------------------------------
# Style-specific Few-Shot Templates
# Provides in-context examples tailored to each humor category.
# This prevents GPT-2 from blurring styles and forces Setup/Punchline format.
# ---------------------------------------------------------------------------
STYLE_FEW_SHOTS = {
    "Adult": [
        {
            "topic": "dating",
            "setup": "Why is sex like a game of poker?",
            "punchline": "You either need a good partner or a really good hand!"
        },
        {
            "topic": "marriage",
            "setup": "My wife left a note saying sex is better on vacation.",
            "punchline": "That was an awkward postcard to receive in the mail!"
        }
    ],
    "Pun": [
        {
            "topic": "fish",
            "setup": "Where do fish keep their savings?",
            "punchline": "In the river bank!"
        },
        {
            "topic": "baking",
            "setup": "Why did the loaf of bread go to therapy?",
            "punchline": "Because it couldn't stop loafing around!"
        }
    ],
    "Roast": [
        {
            "topic": "mirrors",
            "setup": "You are not completely useless.",
            "punchline": "You can always serve as a bad example!"
        },
        {
            "topic": "intelligence",
            "setup": "I would agree with you,",
            "punchline": "but then we would both be wrong!"
        }
    ],
    "Brutal": [
        {
            "topic": "cemetery",
            "setup": "The graveyard is full of indispensable people.",
            "punchline": "And none of them have checked their inbox since!"
        },
        {
            "topic": "cooking",
            "setup": "My cooking is so terrible that the flies banded together.",
            "punchline": "Just to fix the hole in my kitchen window screen!"
        }
    ],
    "Sarcastic": [
        {
            "topic": "Mondays",
            "setup": "Oh, you love getting up at 6 AM on a Monday morning?",
            "punchline": "Please tell me more about your thrilling life choices!"
        },
        {
            "topic": "meetings",
            "setup": "I survived another pointless meeting that could have been an email.",
            "punchline": "My grand prize is getting invited to three more tomorrow!"
        }
    ],
    "Normal": [
        {
            "topic": "coffee",
            "setup": "Why did the cup of coffee call the cops?",
            "punchline": "Because it got mugged in the alley!"
        },
        {
            "topic": "dogs",
            "setup": "What do you call a dog in winter?",
            "punchline": "A chili dog with extra bark!"
        }
    ]
}

STYLE_PREFIX = {k: k for k in STYLE_FEW_SHOTS}

ADULT_KEYWORDS = {
    "sex", "bed", "partner", "wife", "husband", "date", "kiss", "body",
    "dirty", "underwear", "naked", "shower", "hot", "bedroom", "flirt", "hand", "woman", "man"
}

REACTIONS = ["😂", "🤣", "😆", "💀", "🔥", "🎭"]

# ---------------------------------------------------------------------------
# Text helpers & prompt construction
# ---------------------------------------------------------------------------
REDDIT_NOISE = [
    r"\bedit:.*$",
    r"\bi'll see myself out.*$",
    r"\bthanks for (reading|asking).*$",
    r"\bfirst post.*$",
    r"\bupvote.*$",
    r"\br/jokes\b",
    r"\bpunch\s*lines?(\(s\))?:?.*$",
]

def clean_joke(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    for noise in REDDIT_NOISE:
        text = re.sub(noise, "", text, flags=re.IGNORECASE).strip()
    text = re.sub(r"\bWhats\b", "What's", text)
    text = re.sub(r"\bCant\b",  "Can't",  text)
    text = re.sub(r"\bDont\b",  "Don't",  text)
    text = re.sub(r"\bIm\b",    "I'm",    text)
    if text:
        text = text[0].upper() + text[1:]
    if text and text[-1] not in ".!?\"'":
        text += "."
    return text


def is_bad_joke(text: str) -> bool:
    clean = re.sub(r"^(Setup:|Punchline:)\s*", "", text, flags=re.MULTILINE)
    words = clean.split()
    if len(words) < 4:
        return True
    if len(words) == 2 and len(set(words)) == 1:
        return True
    bad_endings = ["because", "and", "but", "if", "the", "named", "with", "for", "to", "a", "an"]
    if any(text.rstrip(".!? ").lower().endswith(x) for x in bad_endings):
        return True
    return False


def score_joke(joke: str, topic: str = "", style: str = "Normal") -> int:
    score = 0
    words = joke.lower().split()
    if not words:
        return 0

    # 1. Base length reward (up to 25 pts)
    score += min(len(words), 25)

    # 2. Setup/Punchline structure reward (+25 pts)
    if "Setup:" in joke and "Punchline:" in joke:
        score += 25

    # 3. Punctuation rewards
    if "?" in joke:
        score += 10
    if "!" in joke:
        score += 8

    # 4. Lexical diversity reward
    if len(words) > 5 and (len(set(words)) / len(words)) > 0.75:
        score += 15

    # 5. Topic relevance reward (+35 pts)
    if topic:
        topic_words = [w.lower() for w in re.findall(r"\w+", topic) if len(w) > 2]
        joke_lower = joke.lower()
        if any(tw in joke_lower for tw in topic_words):
            score += 35

    # 6. Style-specific affinity bonus (+20 pts)
    joke_lower = joke.lower()
    if style == "Adult":
        if any(kw in joke_lower for kw in ADULT_KEYWORDS):
            score += 20
    elif style == "Pun":
        if "?" in joke or any(w in joke_lower for w in ["because", "call", "what", "bank", "river", "dough"]):
            score += 15
    elif style in ("Roast", "Brutal"):
        if any(w in joke_lower for w in ["you", "your", "you're", "ugly", "useless", "dead", "grave"]):
            score += 15
    elif style == "Sarcastic":
        if any(w in joke_lower for w in ["oh", "sure", "love", "thrilling", "prize", "great", "wow"]):
            score += 15

    return score


def build_prompt(style: str, topic: str) -> str:
    """
    Constructs a style-tuned prompt with a primed setup anchor.
    This directly conditions GPT-2's next-token distribution on both
    the topic and the setup structure.
    """
    t = topic.strip()
    
    if style == "Adult":
        # Adult / 18+ / Dirty joke priming
        starters = [
            f"Write an adult dirty joke about {t} with a setup and punchline.\nSetup: Why is {t}",
            f"Write an adult dirty joke about {t} with a setup and punchline.\nSetup: What is the difference between {t} and",
            f"Write an adult humor joke about {t} with a setup and punchline.\nSetup: Why do people into {t}",
        ]
        return random.choice(starters)
    
    elif style == "Pun":
        # Pun wordplay priming
        starters = [
            f"Write a pun joke about {t} with a setup and punchline.\nSetup: Why did the {t}",
            f"Write a pun joke about {t} with a setup and punchline.\nSetup: What do you call a {t}",
        ]
        return random.choice(starters)
        
    elif style == "Roast":
        # Roast / personal burn priming
        starters = [
            f"Write a savage roast joke about {t} with a setup and punchline.\nSetup: You know someone's bad at {t} when",
            f"Write a roast joke about {t} with a setup and punchline.\nSetup: Why does someone who loves {t}",
        ]
        return random.choice(starters)
        
    elif style == "Sarcastic":
        # Cynical / deadpan sarcasm priming
        starters = [
            f"Write a sarcastic joke about {t} with a setup and punchline.\nSetup: Oh, you think {t} is",
            f"Write a sarcastic joke about {t} with a setup and punchline.\nSetup: Why do people pretend {t} is so",
        ]
        return random.choice(starters)
        
    elif style == "Brutal":
        # Dark / brutal joke priming
        starters = [
            f"Write a brutal dark humor joke about {t} with a setup and punchline.\nSetup: What's the difference between {t} and",
            f"Write a brutal dark joke about {t} with a setup and punchline.\nSetup: Why is {t} like",
        ]
        return random.choice(starters)
        
    else:  # Normal
        starters = [
            f"Write a funny joke about {t} with a setup and punchline.\nSetup: Why did the {t}",
            f"Write a funny joke about {t} with a setup and punchline.\nSetup: What do you call a {t}",
        ]
        return random.choice(starters)


def post_process(raw: str, prompt: str) -> str:
    """
    Extracts and parses the generated joke into a clean Setup and Punchline.
    Handles question-answer structures, explicit Punchline labels, and cleans reddit noise.
    """
    # 1. Isolate the setup prompt line
    prompt_setup = prompt.split("Setup:")[-1].strip() if "Setup:" in prompt else ""
    
    # 2. Extract generated continuation
    if prompt and prompt in raw:
        gen = raw[raw.find(prompt) + len(prompt):].strip()
    elif "Setup:" in raw:
        gen = raw.split("Setup:")[-1].strip()
    else:
        gen = raw.strip()

    # Reconstruct full setup line from the primed starter + continuation
    if prompt_setup and not gen.startswith(prompt_setup):
        full_text = f"{prompt_setup} {gen}".strip()
    else:
        full_text = gen.strip()

    # Cut off at common stop tokens or subsequent prompts
    for stop_token in ["\nWrite a", "\nTopic:", "\nJoke:", "\nSetup:", "\n\n"]:
        if stop_token in full_text:
            full_text = full_text.split(stop_token)[0].strip()

    # 3. Parse into Setup and Punchline
    if "Punchline:" in full_text:
        parts = full_text.split("Punchline:", 1)
        setup = parts[0].replace("Setup:", "").strip()
        punchline = parts[1].split("\n")[0].strip()
    elif "A:" in full_text and "Q:" in full_text:
        parts = full_text.split("A:", 1)
        setup = parts[0].replace("Q:", "").strip()
        punchline = parts[1].split("\n")[0].strip()
    elif "Answer:" in full_text:
        parts = full_text.split("Answer:", 1)
        setup = parts[0].strip()
        punchline = parts[1].strip()
    elif "?" in full_text:
        # Split on the first question mark: Question is Setup, remainder is Punchline
        parts = full_text.split("?", 1)
        setup = parts[0].strip() + "?"
        punchline = parts[1].strip()
    elif "..." in full_text:
        # Split on ellipses
        parts = full_text.split("...", 1)
        setup = parts[0].strip() + "..."
        punchline = parts[1].strip()
    elif "." in full_text:
        # Split on first sentence
        parts = full_text.split(".", 1)
        setup = parts[0].strip() + "."
        punchline = parts[1].strip()
    else:
        setup = full_text.strip()
        punchline = ""

    setup = clean_joke(setup)
    if punchline:
        punchline = clean_joke(punchline)
        # Avoid redundant repetition in punchline
        if punchline.lower() != setup.lower():
            return f"Setup: {setup}\nPunchline: {punchline}"
    return setup


# ---------------------------------------------------------------------------
# Global model/tokenizer (loaded once at startup)
# ---------------------------------------------------------------------------
model = None
tokenizer = None
device = "cuda" if torch.cuda.is_available() else "cpu"


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Load model once on startup, release on shutdown."""
    global model, tokenizer
    
    if os.path.isdir(MODEL_DIR) and os.path.exists(os.path.join(MODEL_DIR, "config.json")):
        model_source = MODEL_DIR
        local_only = True
        print(f"[startup] Loading local model from {MODEL_DIR} on {device.upper()}...")
    else:
        model_source = HUGGINGFACE_MODEL_ID
        local_only = False
        print(f"[startup] Loading model from Hugging Face Hub ({HUGGINGFACE_MODEL_ID}) on {device.upper()}...")

    tokenizer = AutoTokenizer.from_pretrained(model_source, use_fast=True)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_source,
        local_files_only=local_only,
    )
    model.eval()
    if device == "cuda":
        model = model.cuda()
    print(f"[startup] ✅ Model loaded from {model_source}, running on {device.upper()}")
    yield
    # cleanup
    del model, tokenizer
    print("[shutdown] Model released.")


# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Joke Generator API",
    description="Fine-tuned GPT-2 Medium joke generator",
    version="2.0.0",
    lifespan=lifespan,
)

# Allow requests from React dev server and production frontends (Vercel, custom domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class JokeRequest(BaseModel):
    topic: str
    style: str = "Normal"
    strict_mode: bool = False
    num_sequences: int = 5


class JokeResponse(BaseModel):
    joke: str
    reaction: str
    style: str
    topic: str
    device: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/api/generate", response_model=JokeResponse)
async def generate_joke(req: JokeRequest):
    """
    Standard (non-streaming) joke generation endpoint.
    Generates `num_sequences` candidates and returns the best-scored one.
    """
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    style_key = req.style if req.style in STYLE_FEW_SHOTS else "Normal"

    # Only apply NSFW filter to topic if strict mode is ON and style is NOT Adult
    if req.strict_mode and style_key != "Adult" and contains_nsfw(topic):
        raise HTTPException(status_code=422, detail="Inappropriate topic detected.")

    prompt = build_prompt(style_key, topic)
    input_ids = tokenizer.encode(prompt, return_tensors="pt").to(device)

    with torch.inference_mode():
        output = model.generate(
            input_ids,
            max_new_tokens=90,
            min_new_tokens=15,
            do_sample=True,
            temperature=0.72,
            top_p=0.90,
            top_k=60,
            repetition_penalty=1.35,
            no_repeat_ngram_size=3,
            num_return_sequences=min(req.num_sequences, 10),
            pad_token_id=tokenizer.eos_token_id,
        )

    jokes = []
    for seq in output:
        raw = tokenizer.decode(seq, skip_special_tokens=True)
        text = post_process(raw, prompt)
        if not is_bad_joke(text):
            jokes.append(text)

    # Filter out NSFW only if strict mode is ON and not in Adult mode
    if req.strict_mode and style_key != "Adult":
        jokes = [j for j in jokes if not contains_nsfw(j)]

    if not jokes:
        raise HTTPException(
            status_code=503,
            detail="Could not generate a good joke. Try a different topic or style.",
        )

    best = max(jokes, key=lambda j: score_joke(j, topic, style_key))
    return JokeResponse(
        joke=best,
        reaction=random.choice(REACTIONS),
        style=style_key,
        topic=topic,
        device=device.upper(),
    )


@app.post("/api/generate-stream")
async def generate_joke_stream(req: JokeRequest):
    """
    Streaming joke generation endpoint using Server-Sent Events.
    Tokens appear in real-time as the model generates them (lowest perceived latency).
    """
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    style_key = req.style if req.style in STYLE_FEW_SHOTS else "Normal"

    if req.strict_mode and style_key != "Adult" and contains_nsfw(topic):
        raise HTTPException(status_code=422, detail="Inappropriate topic detected.")

    prompt = build_prompt(style_key, topic)
    input_ids = tokenizer.encode(prompt, return_tensors="pt").to(device)

    streamer = TextIteratorStreamer(
        tokenizer,
        skip_prompt=True,
        skip_special_tokens=True,
    )

    generation_kwargs = dict(
        input_ids=input_ids,
        streamer=streamer,
        max_new_tokens=90,
        do_sample=True,
        temperature=0.72,
        top_p=0.90,
        top_k=60,
        repetition_penalty=1.35,
        no_repeat_ngram_size=3,
        pad_token_id=tokenizer.eos_token_id,
    )

    # Run model.generate in a background thread so FastAPI stays non-blocking
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    async def token_generator():
        """Yields SSE-formatted chunks as the model streams tokens."""
        collected = []
        for token in streamer:
            collected.append(token)
            # SSE format: data: <payload>\n\n
            payload = json.dumps({"token": token})
            yield f"data: {payload}\n\n"
            await asyncio.sleep(0)  # yield control back to event loop
        # Send final [DONE] event with full joke for post-processing
        full_text = "".join(collected)
        full_text = post_process(full_text, prompt)
        done_payload = json.dumps({"done": True, "joke": full_text, "reaction": random.choice(REACTIONS)})
        yield f"data: {done_payload}\n\n"

    return StreamingResponse(
        token_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/health")
async def health():
    """Health check."""
    return {
        "status": "ok",
        "model": "GPT-2 Medium (fine-tuned)",
        "device": device.upper(),
        "model_dir": MODEL_DIR,
        "huggingface_id": HUGGINGFACE_MODEL_ID,
        "huggingface_url": f"https://huggingface.co/{HUGGINGFACE_MODEL_ID}",
    }


# ---------------------------------------------------------------------------
# Production: serve React build (must be LAST — catch-all)
# ---------------------------------------------------------------------------
_frontend_dist = Path(__file__).parent / "frontend" / "dist"
if _frontend_dist.exists():
    app.mount("/", StaticFiles(directory=_frontend_dist, html=True), name="frontend")

