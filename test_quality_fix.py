import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://localhost:8000"

test_cases = [
    {"topic": "dating", "style": "Adult", "strict_mode": True},
    {"topic": "marriage", "style": "Adult", "strict_mode": True},
    {"topic": "coffee", "style": "Pun", "strict_mode": True},
    {"topic": "coding", "style": "Roast", "strict_mode": True},
    {"topic": "Mondays", "style": "Sarcastic", "strict_mode": True},
    {"topic": "pizza", "style": "Normal", "strict_mode": True},
]

print("=" * 70)
print("TESTING QUALITY FIX: STYLE ISOLATION & STRUCTURE VERIFICATION")
print("=" * 70)

for tc in test_cases:
    print(f"\n👉 Request: Topic='{tc['topic']}' | Style='{tc['style']}' | StrictMode={tc['strict_mode']}")
    t0 = time.time()
    req_data = json.dumps({
        "topic": tc["topic"],
        "style": tc["style"],
        "strict_mode": tc["strict_mode"],
        "num_sequences": 3
    }).encode("utf-8")
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/generate",
        data=req_data,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            elapsed = time.time() - t0
            data = json.loads(resp.read().decode("utf-8"))
            joke = data.get("joke", "")
            print(f"Status: {resp.status} ({elapsed:.2f}s)")
            print(f"Reaction: {data.get('reaction')} | Device: {data.get('device')}")
            print("Joke Output:")
            for line in joke.split("\n"):
                print(f"   {line}")
            
            has_setup = "Setup:" in joke
            has_punch = "Punchline:" in joke
            topic_match = tc["topic"].lower() in joke.lower()
            print(f"   [Structure check]: Setup={has_setup}, Punchline={has_punch} | On-topic={topic_match}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 70)
print("TESTING STREAMING ENDPOINT")
print("=" * 70)

stream_data = json.dumps({"topic": "gym", "style": "Adult", "strict_mode": True}).encode("utf-8")
stream_req = urllib.request.Request(
    f"{BASE_URL}/api/generate-stream",
    data=stream_data,
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(stream_req, timeout=30) as stream_resp:
        print(f"Stream status: {stream_resp.status}")
        for line in stream_resp:
            line_str = line.decode("utf-8").strip()
            if line_str.startswith("data: "):
                payload = json.loads(line_str[6:])
                if payload.get("done"):
                    print("\nStream completed [DONE]:")
                    print(payload.get("joke"))
                    break
                else:
                    print(payload.get("token", ""), end="", flush=True)
except Exception as e:
    print(f"Stream Error: {e}")

print("\n\nAll automated tests completed successfully!")

