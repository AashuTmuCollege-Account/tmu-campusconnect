import httpx, time, requests

# Step 1: Warm up the LLM
print("Step 1: Warming up llama3.2:3b (first call loads it into RAM)...")
s = time.time()
try:
    r = httpx.post(
        'http://localhost:11434/api/generate',
        json={
            'model': 'llama3.2:3b',
            'prompt': 'Say hello in 3 words.',
            'stream': False,
            'options': {'num_predict': 10}
        },
        timeout=120
    )
    t = round(time.time() - s, 1)
    ans = r.json().get('response', '').strip()
    print(f"  Model loaded in {t}s. Response: {ans}")
except Exception as e:
    print(f"  Error: {e}")

# Step 2: Test the full chat endpoint
print()
print("Step 2: Testing the chatbot endpoint...")
s = time.time()
try:
    r = requests.post(
        'http://localhost:8000/api/chat',
        json={'question': 'What courses does TMU offer?', 'session_id': 'warmup-test'},
        timeout=180
    )
    t = round(time.time() - s, 1)
    print(f"  Chat status: {r.status_code} (took {t}s)")
    if r.ok:
        data = r.json()
        print(f"  Answer preview: {data.get('answer','')[:250]}")
        print(f"  Sources: {data.get('sources', [])}")
    else:
        print(f"  Error body: {r.text[:300]}")
except Exception as e:
    t = round(time.time() - s, 1)
    print(f"  Exception after {t}s: {type(e).__name__}: {e}")

print()
print("Done.")
