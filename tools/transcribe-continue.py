import json
import sys
import os
import time
from faster_whisper import WhisperModel

def transcribe_continue(audio_path, output_path, skip_to=0):
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, language="ar", word_timestamps=True)
    
    existing = []
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
    
    words = list(existing)
    start = time.time()
    for segment in segments:
        for word in segment.words:
            if word.start < skip_to:
                continue
            words.append({
                "w": word.word.strip(),
                "s": round(word.start, 3),
                "e": round(word.end, 3),
            })
        if len(words) % 100 < 10:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(words, f, ensure_ascii=False)
            elapsed = time.time() - start
            print(f"[{elapsed:.0f}s] {len(words)} words saved", flush=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)
    print(f"DONE: {len(words)} total words in {time.time()-start:.0f}s", flush=True)

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public = os.path.join(base, "public")
    target = sys.argv[1]
    files = {
        "morning": ("morning-azkar-voice.mp3", "morning-words.json"),
        "evening": ("evening-azkar-voice.mp3", "evening-words.json"),
    }
    mp3, json_name = files[target]
    output_path = os.path.join(public, json_name)
    
    skip_to = 1817
    if target == "morning" and os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
        if existing:
            skip_to = existing[-1]["s"] + 1
            print(f"Continuing from {skip_to:.1f}s ({len(existing)} existing words)")
    
    transcribe_continue(os.path.join(public, mp3), output_path, skip_to)
