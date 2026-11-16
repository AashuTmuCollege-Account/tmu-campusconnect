import requests, time

print("Testing chat with optimized settings...")
print("(3 small chunks, 150 tokens max, 90s timeout)")
print()

s = time.time()
try:
    r = requests.post(
        'http://localhost:8000/api/chat',
        json={'question': 'What is TMU?', 'session_id': 'speed-test'},
        timeout=120
    )
    t = round(time.time() - s, 1)
    print(f"Status: {r.status_code} in {t}s")
    if r.ok:
        data = r.json()
        print(f"\nAnswer:\n{data.get('answer','')}")
        print(f"\nSources: {data.get('sources', [])}")
    else:
        print(f"Error: {r.text[:400]}")
except Exception as e:
    t = round(time.time() - s, 1)
    print(f"Exception after {t}s: {type(e).__name__}: {e}")
