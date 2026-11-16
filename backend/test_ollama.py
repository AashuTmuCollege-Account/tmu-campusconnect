import httpx, time

print("Testing Ollama embedding...")
start = time.time()
try:
    r = httpx.post(
        'http://localhost:11434/api/embeddings',
        json={'model': 'mxbai-embed-large', 'prompt': 'hello world'},
        timeout=30
    )
    elapsed = round(time.time() - start, 1)
    print(f"Embed status: {r.status_code}, took {elapsed}s")
    emb = r.json().get('embedding', [])
    print(f"Embedding dimensions: {len(emb)}")
except Exception as e:
    print(f"Embed ERROR after {round(time.time()-start,1)}s: {type(e).__name__}: {e}")

print()
print("Testing Ollama LLM (llama3:8b)...")
start = time.time()
try:
    r = httpx.post(
        'http://localhost:11434/api/generate',
        json={
            'model': 'llama3:8b',
            'prompt': 'Say hello in one word.',
            'stream': False,
            'options': {'num_predict': 5}
        },
        timeout=90
    )
    elapsed = round(time.time() - start, 1)
    print(f"LLM status: {r.status_code}, took {elapsed}s")
    resp = r.json()
    print(f"LLM response: {resp.get('response', '')}")
except Exception as e:
    print(f"LLM ERROR after {round(time.time()-start,1)}s: {type(e).__name__}: {e}")

print()
print("Done.")
