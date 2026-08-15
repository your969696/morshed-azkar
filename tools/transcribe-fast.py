import json
import sys
import os
import subprocess
from faster_whisper import WhisperModel

def split_audio(input_path, chunk_dir, chunk_minutes=10):
    os.makedirs(chunk_dir, exist_ok=True)
    duration_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{input_path}"'
    duration = float(subprocess.check_output(duration_cmd, shell=True).decode().strip())
    chunk_secs = chunk_minutes * 60
    chunks = []
    start = 0
    idx = 0
    while start < duration:
        end = min(start + chunk_secs, duration)
        out = os.path.join(chunk_dir, f"chunk_{idx:03d}.wav")
        cmd = f'ffmpeg -y -i "{input_path}" -ss {start} -to {end} -ar 16000 -ac 1 "{out}" 2>nul'
        subprocess.run(cmd, shell=True)
        chunks.append({"path": out, "offset": start, "idx": idx})
        print(f"  Split chunk {idx}: {start:.0f}s - {end:.0f}s")
        start = end
        idx += 1
    print(f"  Total chunks: {len(chunks)}")
    return chunks, duration

def transcribe_chunks(model, chunks, output_path):
    all_words = []
    for chunk in chunks:
        offset = chunk["offset"]
        idx = chunk["idx"]
        print(f"  Transcribing chunk {idx} (offset {offset:.0f}s)...")
        segments, info = model.transcribe(chunk["path"], language="ar", word_timestamps=True)
        chunk_words = 0
        for segment in segments:
            for word in segment.words:
                all_words.append({
                    "word": word.word.strip(),
                    "start": round(word.start + offset, 3),
                    "end": round(word.end + offset, 3),
                })
                chunk_words += 1
        print(f"  Chunk {idx}: {chunk_words} words")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"words": all_words}, f, ensure_ascii=False)
    print(f"Done! Saved {len(all_words)} words to {output_path}")
    return all_words

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public = os.path.join(base, "public")
    tmp = os.path.join(base, "tools", "chunks")
    
    target = sys.argv[1] if len(sys.argv) > 1 else "morning"
    
    files = {
        "morning": ("morning-azkar-voice.mp3", "morning-azkar-timestamps.json"),
        "evening": ("evening-azkar-voice.mp3", "evening-azkar-timestamps.json"),
    }
    
    mp3, json_name = files[target]
    mp3_path = os.path.join(public, mp3)
    json_path = os.path.join(public, json_name)
    
    print(f"=== Splitting {mp3} ===")
    chunks, duration = split_audio(mp3_path, os.path.join(tmp, target), chunk_minutes=10)
    
    print(f"\n=== Loading whisper tiny model ===")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    
    print(f"\n=== Transcribing {len(chunks)} chunks (total: {duration:.0f}s) ===")
    transcribe_chunks(model, chunks, json_path)
    
    # cleanup chunks
    import shutil
    chunk_dir = os.path.join(tmp, target)
    if os.path.exists(chunk_dir):
        shutil.rmtree(chunk_dir)
    print("Cleaned up temp files")
