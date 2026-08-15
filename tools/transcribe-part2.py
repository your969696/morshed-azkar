import json
import os
import time
from faster_whisper import WhisperModel

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public = os.path.join(base, "public")
tools = os.path.join(base, "tools")

existing_file = os.path.join(public, "morning-words.json")
with open(existing_file, "r", encoding="utf-8") as f:
    existing = json.load(f)

last_time = existing[-1]["s"]
print(f"Existing: {len(existing)} words, last at {last_time:.1f}s")

model = WhisperModel("tiny", device="cpu", compute_type="int8")

part2_wav = os.path.join(tools, "morning-part2.wav")
print(f"Transcribing part2 from {last_time:.1f}s...")
start = time.time()
segments, info = model.transcribe(part2_wav, language="ar", word_timestamps=True)

new_words = []
for segment in segments:
    for word in segment.words:
        new_words.append({
            "w": word.word.strip(),
            "s": round(word.start + last_time, 3),
            "e": round(word.end + last_time, 3),
        })
    elapsed = time.time() - start
    print(f"  [{elapsed:.0f}s] {len(new_words)} new words...", flush=True)

all_words = existing + new_words
output_path = os.path.join(public, "morning-words.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(all_words, f, ensure_ascii=False)

elapsed = time.time() - start
print(f"DONE: {len(new_words)} new words + {len(existing)} existing = {len(all_words)} total in {elapsed:.0f}s")
