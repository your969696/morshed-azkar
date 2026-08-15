import json
import sys
import os
import time
from faster_whisper import WhisperModel

def transcribe_file(audio_path, output_path):
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, language="ar", word_timestamps=True)
    
    words = []
    start = time.time()
    for segment in segments:
        for word in segment.words:
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
    print(f"DONE: {len(words)} words in {time.time()-start:.0f}s", flush=True)

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public = os.path.join(base, "public")
    target = sys.argv[1]
    files = {
        "morning": ("morning-azkar-voice.mp3", "morning-words.json"),
        "evening": ("evening-azkar-voice.mp3", "evening-words.json"),
    }
    mp3, json_name = files[target]
    transcribe_file(os.path.join(public, mp3), os.path.join(public, json_name))
