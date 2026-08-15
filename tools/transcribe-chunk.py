import json, os, sys, time, subprocess
from faster_whisper import WhisperModel

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public = os.path.join(base, "public")
tools = os.path.join(base, "tools")

target = sys.argv[1]

if target == "morning":
    mp3 = os.path.join(public, "morning-azkar-voice.mp3")
    json_path = os.path.join(public, "morning-words.json")
else:
    mp3 = os.path.join(public, "evening-azkar-voice.mp3")
    json_path = os.path.join(public, "evening-words.json")

existing = []
offset = 0
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        existing = json.load(f)
    if existing:
        offset = existing[-1]["s"] + 0.1
        print(f"Existing {len(existing)} words, starting from {offset:.1f}s", flush=True)
    else:
        print("No existing words, starting fresh", flush=True)
else:
    print("No existing file, starting fresh", flush=True)

chunk_wav = os.path.join(tools, f"{target}-chunk.wav")
if offset > 0:
    cmd = f'ffmpeg -y -i "{mp3}" -ss {offset} -ar 16000 -ac 1 "{chunk_wav}" 2>nul'
    subprocess.run(cmd, shell=True, capture_output=True)
    audio_path = chunk_wav
    print(f"Cut audio from {offset:.1f}s", flush=True)
else:
    audio_path = mp3

model = WhisperModel("tiny", device="cpu", compute_type="int8")
print("Transcribing...", flush=True)
start = time.time()
segments, info = model.transcribe(audio_path, language="ar", word_timestamps=True)

new_words = []
for segment in segments:
    for word in segment.words:
        new_words.append({
            "w": word.word.strip(),
            "s": round(word.start + offset, 3),
            "e": round(word.end + offset, 3),
        })
    if len(new_words) % 200 < 20:
        combined = existing + new_words
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(combined, f, ensure_ascii=False)
        elapsed = time.time() - start
        print(f"[{elapsed:.0f}s] {len(new_words)} new + {len(existing)} = {len(combined)} total", flush=True)

combined = existing + new_words
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(combined, f, ensure_ascii=False)

elapsed = time.time() - start
print(f"DONE: {len(new_words)} new + {len(existing)} existing = {len(combined)} total in {elapsed:.0f}s", flush=True)

if os.path.exists(chunk_wav):
    os.remove(chunk_wav)
