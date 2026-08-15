import os, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

# Check originals vs enhanced
src = r"C:\Users\Hatem\Downloads\اسماء الله"
enhanced = r"C:\Users\Hatem\Documents\azkar-app\public\names-voices"

orig_files = sorted([f for f in os.listdir(src) if f.endswith('.mp3')])

print("=== ORIGINAL vs ENHANCED durations ===")
for i in range(min(5, len(orig_files))):
    orig_path = os.path.join(src, orig_files[i])
    enh_path = os.path.join(enhanced, f"{i+1}.mp3")
    
    r1 = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", orig_path], capture_output=True, text=True)
    r2 = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", enh_path], capture_output=True, text=True)
    
    orig_dur = r1.stdout.strip()
    enh_dur = r2.stdout.strip()
    print(f"  {orig_files[i]}: {orig_dur}s -> enhanced: {enh_dur}s")

# Also check if enhanced files have actual audio
print("\n=== Volume analysis of enhanced files ===")
for i in [0, 10, 25, 50, 99]:
    f = os.path.join(enhanced, f"{i+1}.mp3")
    if os.path.exists(f):
        r = subprocess.run(["ffmpeg", "-i", f, "-af", "volumedetect", "-f", "null", "-t", "5", "/dev/null"], capture_output=True, text=True)
        for line in r.stderr.split("\n"):
            if "mean_volume" in line or "max_volume" in line:
                print(f"  {i+1}.mp3: {line.strip()}")
