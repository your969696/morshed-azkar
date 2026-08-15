"""
enhance-names.py - Professional Audio Enhancement for Names of Allah
"""

import os
import subprocess
import sys

# Fix encoding
sys.stdout.reconfigure(encoding='utf-8')

# Paths
OUTPUT_DIR = r"C:\Users\Hatem\Documents\azkar-app\public\names-voices"
TEMP_DIR = r"C:\Users\Hatem\Documents\azkar-app\tools\temp-names"

# Create output directories
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Get all MP3 files using os.scandir for better Unicode support
source_dir = None
for entry in os.scandir(r"C:\Users\Hatem\Downloads"):
    if entry.is_dir() and "اسماء الله" in entry.name:
        source_dir = entry.path
        break

if not source_dir:
    print("ERROR: Could not find 'أسماء الله' folder")
    sys.exit(1)

print(f"Source: {source_dir}")
files = sorted([f.name for f in os.scandir(source_dir) if f.name.endswith('.mp3')])

print(f"Found {len(files)} Names of Allah audio files")
print("Processing with studio-quality enhancement...\n")

# Audio enhancement filter chain
FILTERS = (
    "afftdn=nf=-25:nr=12:nt=w,"
    "anlmdn=s=7:r=0.002:m=15,"
    "highpass=f=80,"
    "lowpass=f=16000,"
    "equalizer=f=200:t=q:w=1:g=2,"
    "equalizer=f=3000:t=q:w=1:g=3,"
    "acompressor=threshold=-20dB:ratio=4:attack=5:release=50,"
    "loudnorm=I=-16:TP=-1.5:LRA=11,"
    "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB:"
    "stop_periods=1:stop_duration=0.1:stop_threshold=-40dB"
)

counter = 1
success_count = 0

for filename in files:
    input_path = os.path.join(source_dir, filename)
    base_name = os.path.splitext(filename)[0]
    output_path = os.path.join(OUTPUT_DIR, f"{counter}.mp3")
    temp_wav = os.path.join(TEMP_DIR, f"{base_name}.wav")
    
    print(f"[{counter}/{len(files)}] Processing: {base_name}")
    
    try:
        # Convert to WAV for processing
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-ar", "44100", "-ac", "2",
            temp_wav
        ], capture_output=True, check=True)
        
        # Apply enhancement and convert to high-quality MP3
        subprocess.run([
            "ffmpeg", "-y", "-i", temp_wav,
            "-af", FILTERS,
            "-codec:a", "libmp3lame",
            "-b:a", "192k",
            "-ar", "44100",
            "-ac", "2",
            output_path
        ], capture_output=True, check=True)
        
        success_count += 1
        
    except subprocess.CalledProcessError as e:
        print(f"  ERROR: {e}")
    
    finally:
        if os.path.exists(temp_wav):
            os.remove(temp_wav)
    
    counter += 1

print(f"\n{'='*50}")
print(f"Done! Enhanced {success_count}/{len(files)} Names of Allah files")
print(f"Output: {OUTPUT_DIR}")

# Summary
enhanced_files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.mp3')]
total_size = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in enhanced_files)
print(f"Total enhanced audio: {total_size/1024/1024:.2f} MB")