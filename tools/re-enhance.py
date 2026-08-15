"""
re-enhance.py - Re-process audio files without aggressive silence removal
"""

import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

# === NAMES OF ALLAH ===
names_source = None
for entry in os.scandir(r"C:\Users\Hatem\Downloads"):
    if entry.is_dir() and "اسماء الله" in entry.name:
        names_source = entry.path
        break

names_output = r"C:\Users\Hatem\Documents\azkar-app\public\names-voices"
names_temp = r"C:\Users\Hatem\Documents\azkar-app\tools\temp-names"

os.makedirs(names_output, exist_ok=True)
os.makedirs(names_temp, exist_ok=True)

# Simpler filter chain - no silenceremove, gentler denoise
FILTERS = (
    "afftdn=nf=-30:nr=10:nt=w,"
    "highpass=f=60,"
    "lowpass=f=18000,"
    "equalizer=f=200:t=q:w=1:g=2,"
    "equalizer=f=3000:t=q:w=1:g=3,"
    "acompressor=threshold=-25dB:ratio=3:attack=5:release=50,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)

files = sorted([f.name for f in os.scandir(names_source) if f.name.endswith('.mp3')])
print(f"Re-enhancing {len(files)} Names of Allah files...")

for i, filename in enumerate(files, 1):
    input_path = os.path.join(names_source, filename)
    output_path = os.path.join(names_output, f"{i}.mp3")
    temp_wav = os.path.join(names_temp, f"{i}.wav")
    
    print(f"  [{i}/{len(files)}] {filename}")
    
    try:
        subprocess.run(["ffmpeg", "-y", "-i", input_path, "-ar", "44100", "-ac", "2", temp_wav],
                       capture_output=True, check=True)
        subprocess.run(["ffmpeg", "-y", "-i", temp_wav, "-af", FILTERS,
                        "-codec:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", "-ac", "2", output_path],
                       capture_output=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"  ERROR: {e}")
    finally:
        if os.path.exists(temp_wav):
            os.remove(temp_wav)

# === HOURLY AZKAR ===
azkar_source = r"C:\Users\Hatem\Downloads\ذكر"
azkar_output = r"C:\Users\Hatem\Documents\azkar-app\public\azkar-voices"
azkar_temp = r"C:\Users\Hatem\Documents\azkar-app\tools\temp-azkar"

os.makedirs(azkar_output, exist_ok=True)
os.makedirs(azkar_temp, exist_ok=True)

azkar_files = sorted([f for f in os.listdir(azkar_source) if f.endswith('.mp3')])
print(f"\nRe-enhancing {len(azkar_files)} Azkar files...")

for i, filename in enumerate(azkar_files, 1):
    input_path = os.path.join(azkar_source, filename)
    output_path = os.path.join(azkar_output, f"{i}.mp3")
    temp_wav = os.path.join(azkar_temp, f"{i}.wav")
    
    print(f"  [{i}/{len(azkar_files)}] {filename}")
    
    try:
        subprocess.run(["ffmpeg", "-y", "-i", input_path, "-ar", "44100", "-ac", "2", temp_wav],
                       capture_output=True, check=True)
        subprocess.run(["ffmpeg", "-y", "-i", temp_wav, "-af", FILTERS,
                        "-codec:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", "-ac", "2", output_path],
                       capture_output=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"  ERROR: {e}")
    finally:
        if os.path.exists(temp_wav):
            os.remove(temp_wav)

# Verify
print("\n=== Verification ===")
for label, folder in [("Names", names_output), ("Azkar", azkar_output)]:
    for f in sorted(os.listdir(folder))[:3]:
        path = os.path.join(folder, f)
        r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                          capture_output=True, text=True)
        print(f"  {label}/{f}: {r.stdout.strip()}s")

print("\nDone!")
