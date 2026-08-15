import json
import os
import subprocess
import sys
import re

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public = os.path.join(base, "public")
    
    target = sys.argv[1] if len(sys.argv) > 1 else "morning"
    
    if target == "morning":
        mp3 = os.path.join(public, "morning-azkar-voice.mp3")
        json_out = os.path.join(public, "morning-timeline.json")
    else:
        mp3 = os.path.join(public, "evening-azkar-voice.mp3")
        json_out = os.path.join(public, "evening-timeline.json")
    
    dur_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{mp3}"'
    duration = float(subprocess.check_output(dur_cmd, shell=True).decode().strip())
    print(f"Duration: {duration:.1f}s ({duration/60:.1f} min)")
    
    cmd = f'ffmpeg -i "{mp3}" -af "silencedetect=noise=-35dB:d=0.8" -f null - 2>&1'
    result = subprocess.run(cmd, shell=True, capture_output=True, encoding='utf-8', errors='replace')
    output = (result.stdout or "") + "\n" + (result.stderr or "")
    
    starts = re.findall(r'silence_start:\s*([\d.]+)', output)
    ends = re.findall(r'silence_end:\s*([\d.]+)', output)
    
    print(f"Found {len(starts)} silence starts, {len(ends)} silence ends")
    
    boundaries = [0]
    for s, e in zip(starts, ends):
        boundaries.append((float(s) + float(e)) / 2)
    boundaries.append(duration)
    
    print(f"Total boundaries: {len(boundaries)} (expected ~{len(boundaries)-2} azkar)")
    
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump({"boundaries": boundaries, "duration": duration}, f)
    
    print(f"Saved to {json_out}")
    for i in range(min(20, len(boundaries))):
        print(f"  [{boundaries[i]:.1f}s]")
