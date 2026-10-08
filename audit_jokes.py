"""
Joke Quality Audit Script
Generates 100 jokes across all styles and topics, scores them,
and produces a detailed audit report.
"""

import os
import re
import json
import random
import time
import sys
from collections import defaultdict, Counter

# ---------------------------------------------------------------------------
# Copy model-loading globals directly from main.py
# ---------------------------------------------------------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = os.path.join(BASE_DIR, "fine-tuned-gpt2")
HF_MODEL   = "tejasoke/joke-generator-gpt2"

print("Loading model…", flush=True)
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

device = "cuda" if torch.cuda.is_available() else "cpu"

if os.path.isdir(MODEL_DIR) and os.path.exists(os.path.join(MODEL_DIR, "config.json")):
    tok = AutoTokenizer.from_pretrained(MODEL_DIR, use_fast=True)
    mdl = AutoModelForCausalLM.from_pretrained(MODEL_DIR, local_files_only=True)
else:
    tok = AutoTokenizer.from_pretrained(HF_MODEL)
    mdl = AutoModelForCausalLM.from_pretrained(HF_MODEL)

tok.pad_token = tok.eos_token
mdl.eval()
if device == "cuda":
    mdl = mdl.cuda()
print(f"✅ Model loaded on {device.upper()}\n", flush=True)

# ---------------------------------------------------------------------------
# Mirror helpers from main.py exactly
# ---------------------------------------------------------------------------
STYLE_PREFIX = {
    "Normal":    "Funny",
    "Roast":     "roast",
    "Brutal":    "brutal",
    "Sarcastic": "sarcastic",
    "Adult":     "adult humor",
    "Pun":       "pun",
}

TOPICS = [
    "coding",       "exams",        "gym",          "office life",
    "Mondays",      "coffee",       "pizza",        "sleep",
    "doctors",      "traffic",      "smartphones",  "social media",
    "dating",       "parents",      "weather",      "AI",
    "cats",         "dogs",         "politicians",  "money",
]

def build_prompt(style: str, topic: str) -> str:
    return (
        f"Write a {style} joke about {topic} "
        f"with a setup and punchline.\nSetup:"
    )

def clean_joke(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\bWhats\b", "What's", text)
    text = re.sub(r"\bCant\b",  "Can't",  text)
    text = re.sub(r"\bDont\b",  "Don't",  text)
    text = re.sub(r"\bIm\b",    "I'm",    text)
    if text:
        text = text[0].upper() + text[1:]
    if text.lower().startswith(("what", "why", "when", "where", "who", "how")) \
            and not text.endswith("?"):
        text += "?"
    elif text and text[-1] not in ".!?":
        text += "."
    return text

def post_process(raw: str, prompt: str) -> str:
    text = raw.replace(prompt, "").strip()
    if text.startswith("Setup:"):
        text = text[len("Setup:"):].strip()
    if "Punchline:" in text:
        setup, punchline = text.split("Punchline:", 1)
        text = f"Setup: {setup.strip()}\nPunchline: {punchline.strip()}"
    return clean_joke(text)

def is_bad_joke(text: str) -> bool:
    words = text.split()
    if len(words) < 10:
        return True
    bad_endings = ["because", "and", "but", "if", "the", "named", "with", "for"]
    if any(text.lower().endswith(x) for x in bad_endings):
        return True
    return False

def score_joke(joke: str) -> int:
    score = 0
    words = joke.split()
    score += min(len(words), 30)
    if "?" in joke:        score += 10
    if "!" in joke:        score += 10
    if words and len(set(words)) / len(words) > 0.8:
        score += 20
    return score

# ---------------------------------------------------------------------------
# Richer quality dimensions for the audit
# ---------------------------------------------------------------------------
def has_setup_punchline(joke: str) -> bool:
    """Does the joke contain a clear setup + punchline structure?"""
    return "Setup:" in joke and "Punchline:" in joke

def is_repetitive(joke: str) -> bool:
    """Are more than 30% of words duplicated?"""
    words = joke.lower().split()
    if not words:
        return True
    return len(set(words)) / len(words) < 0.55

def ends_coherently(joke: str) -> bool:
    return bool(joke and joke[-1] in ".!?")

def references_topic(joke: str, topic: str) -> bool:
    """Does the joke actually mention something related to the topic?"""
    kw = topic.lower().replace("-", " ").split()
    joke_lower = joke.lower()
    return any(k in joke_lower for k in kw)

def grade(score: int) -> str:
    if score >= 55:  return "A"
    if score >= 45:  return "B"
    if score >= 35:  return "C"
    if score >= 20:  return "D"
    return "F"

# ---------------------------------------------------------------------------
# Generate 100 jokes
# ---------------------------------------------------------------------------
TOTAL   = 100
STYLES  = list(STYLE_PREFIX.keys())
results = []
rejected_count = 0
total_attempts = 0

print(f"Generating {TOTAL} jokes across {len(STYLES)} styles × {len(TOPICS)} topics…\n")

n = 0
while n < TOTAL:
    topic     = random.choice(TOPICS)
    style_key = random.choice(STYLES)
    style_val = STYLE_PREFIX[style_key]
    prompt    = build_prompt(style_val, topic)

    ids = tok.encode(prompt, return_tensors="pt").to(device)

    with torch.inference_mode():
        out = mdl.generate(
            ids,
            max_new_tokens=120,
            min_new_tokens=15,
            do_sample=True,
            temperature=0.85,
            top_p=0.92,
            top_k=50,
            repetition_penalty=1.4,
            no_repeat_ngram_size=3,
            num_return_sequences=3,
            pad_token_id=tok.eos_token_id,
        )

    total_attempts += len(out)
    best = None
    best_score = -1

    for seq in out:
        raw   = tok.decode(seq, skip_special_tokens=True)
        joke  = post_process(raw, prompt)
        if is_bad_joke(joke):
            rejected_count += 1
            continue
        s = score_joke(joke)
        if s > best_score:
            best_score = s
            best = joke

    if best is None:
        rejected_count += 3
        continue

    word_count = len(best.split())
    entry = {
        "id":             n + 1,
        "topic":          topic,
        "style":          style_key,
        "joke":           best,
        "word_count":     word_count,
        "score":          best_score,
        "grade":          grade(best_score),
        "has_structure":  has_setup_punchline(best),
        "is_repetitive":  is_repetitive(best),
        "ends_properly":  ends_coherently(best),
        "on_topic":       references_topic(best, topic),
    }
    results.append(entry)
    n += 1
    sys.stdout.write(f"\r  ✓ {n}/{TOTAL}  (rejected {rejected_count} bad candidates so far)")
    sys.stdout.flush()

print(f"\n\nDone. Total model calls: {total_attempts}")

# ---------------------------------------------------------------------------
# Compute audit metrics
# ---------------------------------------------------------------------------
scores         = [r["score"]       for r in results]
word_counts    = [r["word_count"]  for r in results]
grades         = Counter(r["grade"]        for r in results)
structured     = sum(r["has_structure"]  for r in results)
repetitive     = sum(r["is_repetitive"]  for r in results)
on_topic       = sum(r["on_topic"]        for r in results)
ends_ok        = sum(r["ends_properly"]  for r in results)
fail_rate      = rejected_count / max(total_attempts, 1) * 100

by_style = defaultdict(list)
for r in results:
    by_style[r["style"]].append(r["score"])

by_topic = defaultdict(list)
for r in results:
    by_topic[r["topic"]].append(r["score"])

# worst and best
worst5 = sorted(results, key=lambda r: r["score"])[:5]
best5  = sorted(results, key=lambda r: r["score"], reverse=True)[:5]

# ---------------------------------------------------------------------------
# Write JSON dump of all 100 jokes
# ---------------------------------------------------------------------------
out_path = os.path.join(BASE_DIR, "audit_jokes.json")
with open(out_path, "w") as f:
    json.dump(results, f, indent=2)

# ---------------------------------------------------------------------------
# Print audit report
# ---------------------------------------------------------------------------
SEP = "=" * 72

print(f"\n{SEP}")
print(" 🔍  JOKE QUALITY AUDIT REPORT")
print(f"{SEP}")

print(f"\n{'── OVERALL SCORES':-<72}")
print(f"  Jokes generated:        {TOTAL}")
print(f"  Total model attempts:   {total_attempts}")
print(f"  Rejection rate:         {fail_rate:.1f}%  ({rejected_count} rejected)")
print(f"  Avg score:              {sum(scores)/len(scores):.1f}  (max possible ≈ 70)")
print(f"  Median score:           {sorted(scores)[len(scores)//2]}")
print(f"  Min / Max score:        {min(scores)} / {max(scores)}")
print(f"  Avg word count:         {sum(word_counts)/len(word_counts):.1f} words")

print(f"\n{'── GRADE DISTRIBUTION':-<72}")
for g in "A B C D F".split():
    count = grades.get(g, 0)
    bar   = "█" * count
    print(f"  {g}:  {bar:<50} {count:>3} jokes")

print(f"\n{'── STRUCTURE & COHERENCE':-<72}")
print(f"  Has Setup/Punchline format:  {structured:>3} / {TOTAL}  ({structured/TOTAL*100:.0f}%)")
print(f"  On-topic (mentions topic):   {on_topic:>3} / {TOTAL}  ({on_topic/TOTAL*100:.0f}%)")
print(f"  Ends with punctuation:       {ends_ok:>3} / {TOTAL}  ({ends_ok/TOTAL*100:.0f}%)")
print(f"  Repetitive output:           {repetitive:>3} / {TOTAL}  ({repetitive/TOTAL*100:.0f}%)")

print(f"\n{'── SCORE BY STYLE':-<72}")
for style in STYLES:
    s = by_style.get(style, [])
    if s:
        print(f"  {style:<12}  avg={sum(s)/len(s):.1f}  n={len(s)}")
    else:
        print(f"  {style:<12}  (no samples)")

print(f"\n{'── SCORE BY TOPIC (top 10 topics)':-<72}")
topic_avgs = sorted(
    [(t, sum(v)/len(v), len(v)) for t, v in by_topic.items()],
    key=lambda x: x[1], reverse=True
)
for t, avg, n in topic_avgs[:10]:
    print(f"  {t:<20}  avg={avg:.1f}  n={n}")

print(f"\n{'── TOP 5 BEST JOKES':-<72}")
for r in best5:
    print(f"\n  [#{r['id']}] Score={r['score']}  Grade={r['grade']}  Topic={r['topic']}  Style={r['style']}")
    print(f"  {r['joke']}")

print(f"\n{'── TOP 5 WORST JOKES':-<72}")
for r in worst5:
    print(f"\n  [#{r['id']}] Score={r['score']}  Grade={r['grade']}  Topic={r['topic']}  Style={r['style']}")
    print(f"  {r['joke']}")

# ---------------------------------------------------------------------------
# Root-cause diagnosis
# ---------------------------------------------------------------------------
print(f"\n{SEP}")
print(" 🏥  ROOT-CAUSE DIAGNOSIS")
print(SEP)

issues = []

if fail_rate > 40:
    issues.append(
        ("HIGH REJECTION RATE",
         f"{fail_rate:.0f}% of model candidates are rejected by is_bad_joke(). "
         "The model frequently outputs incomplete or too-short sentences. "
         "CAUSE: GPT-2 is a small general LM; without stop-tokens the generation often "
         "cuts off mid-sentence when max_new_tokens is hit.")
    )

if structured < TOTAL * 0.15:
    issues.append(
        ("MISSING SETUP/PUNCHLINE STRUCTURE",
         f"Only {structured}/{TOTAL} jokes have a clear Setup:/Punchline: format. "
         "CAUSE: The prompt says 'with a setup and punchline.\\nSetup:' but the model "
         "does not reliably produce the literal 'Punchline:' token because the training "
         "data likely used varied or inconsistent formatting.")
    )

if on_topic < TOTAL * 0.5:
    issues.append(
        ("OFF-TOPIC GENERATION",
         f"Only {on_topic}/{TOTAL} jokes actually mention the requested topic. "
         "CAUSE: GPT-2 Medium was fine-tuned on a jokes corpus but without instruction-tuning, "
         "it ignores the topic prompt and generates joke-like text that just continues "
         "the training distribution pattern.")
    )

if repetitive > TOTAL * 0.2:
    issues.append(
        ("REPETITIVE TEXT",
         f"{repetitive}/{TOTAL} jokes have high word repetition. "
         "CAUSE: GPT-2 without repetition_penalty tends to loop. "
         "Even with repetition_penalty=1.4 the tokenizer-level penalty can miss "
         "semantic repetition.")
    )

if sum(scores)/len(scores) < 40:
    issues.append(
        ("LOW AVERAGE SCORE",
         f"Average score is {sum(scores)/len(scores):.1f}/70. "
         "CAUSE: score_joke() rewards question marks, exclamation marks and vocab diversity — "
         "exactly the elements GPT-2 omits when it produces run-on descriptive sentences "
         "instead of punchline-style wit.")
    )

if not issues:
    issues.append(("GENERALLY OK", "No critical issues detected in this run."))

for i, (title, detail) in enumerate(issues, 1):
    print(f"\n  Issue #{i}: {title}")
    print(f"  {'─'*60}")
    # word-wrap at 65 chars
    for chunk in [detail[j:j+65] for j in range(0, len(detail), 65)]:
        print(f"  {chunk}")

print(f"\n{SEP}")
print(" 💡  RECOMMENDED FIXES")
print(SEP)
fixes = [
    "1. PROMPT ENGINEERING: Change prompt from generic 'Write a joke' to a few-shot "
    "example template that shows the exact output format you want:\n"
    "   Q: Why did the programmer quit? A: Because he didn't get arrays.\n"
    "   Q: Why do coders prefer dark mode? A: Because light attracts bugs!\n"
    "   Q: Write a sarcastic joke about {topic}.\n"
    "   A:",

    "2. POST-PROCESSING: Strip the entire prompt prefix (not just 'Setup:') and "
    "apply a stronger sentence-boundary splitter. If a second sentence exists, "
    "use it as the punchline.",

    "3. GENERATION PARAMS: Lower temperature to 0.7 (more focused), "
    "raise top_k to 80, add min_new_tokens=30 to avoid empty outputs.",

    "4. SCORING: Add a keyword presence bonus (+15) if the joke contains the topic "
    "word, and a structural bonus (+20) if it contains a '?' followed by an answer.",

    "5. FINE-TUNING DATA: If you retrain, ensure the training CSV has consistent "
    "Q:/A: or Setup:/Punchline: delimiters so the model learns the format reliably.",

    "6. MODEL UPGRADE: Consider upgrading to a LoRA-fine-tuned Mistral-7B or "
    "TinyLlama (both run on CPU) which are instruction-tuned and follow prompts "
    "more reliably than raw GPT-2.",
]
for fix in fixes:
    print()
    for chunk in [fix[j:j+68] for j in range(0, len(fix), 68)]:
        print(f"  {chunk}")

print(f"\n{SEP}")
print(f"  Full joke dump saved to: {out_path}")
print(SEP + "\n")
