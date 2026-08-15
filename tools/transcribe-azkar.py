import json
import sys
import os
from faster_whisper import WhisperModel

def transcribe_file(audio_path, output_path):
    print(f"Loading model for: {audio_path}")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    
    print(f"Transcribing: {audio_path}")
    segments, info = model.transcribe(audio_path, language="ar", word_timestamps=True)
    
    words = []
    count = 0
    for segment in segments:
        for word in segment.words:
            words.append({
                "word": word.word.strip(),
                "start": round(word.start, 3),
                "end": round(word.end, 3),
            })
            count += 1
            if count % 50 == 0:
                print(f"  Processed {count} words...", flush=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"words": words}, f, ensure_ascii=False)
    
    print(f"Done! Saved {len(words)} words to {output_path}")

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public = os.path.join(base, "public")
    
    target = sys.argv[1] if len(sys.argv) > 1 else "morning"
    
    files = {
        "morning": ("morning-azkar-voice.mp3", "morning-azkar-timestamps.json"),
        "evening": ("evening-azkar-voice.mp3", "evening-azkar-timestamps.json"),
    }
    
    mp3, json_name = files[target]
    mp3_path = os.path.join(public, mp3)
    json_path = os.path.join(public, json_name)
    transcribe_file(mp3_path, json_path)
