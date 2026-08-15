"""
enhance-azkar.py - Professional Audio Enhancement for Azkar
Uses ffmpeg with studio-quality processing chain
"""

import os
import subprocess
import sys
from pathlib import Path

# Paths
SOURCE_DIR = r"C:\Users\Hatem\Downloads\ذكر"
OUTPUT_DIR = r"C:\Users\Hatem\Documents\azkar-app\public\azkar-voices"
TEMP_DIR = r"C:\Users\Hatem\Documents\azkar-app\tools\temp-enhance"

# Create output directories
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Get all MP3 files
files = sorted([f for f in os.listdir(SOURCE_DIR) if f.endswith('.mp3')])

print(f"Found {len(files)} audio files to process")
print("Processing with studio-quality enhancement...\n")

# Audio enhancement filter chain
# 1. afftdn - FFT-based noise reduction
# 2. anlmdn - Non-local means denoiser (additional cleanup)
# 3. highpass - Remove low-frequency rumble (<80Hz)
# 4. lowpass - Remove high-frequency hiss (>16kHz)
# 5. equalizer - Boost presence (3kHz) and warmth (200Hz)
# 6. acompressor - Smooth dynamic range
# 7. loudnorm - EBU R128 loudness normalization (-16 LUFS)
# 8. silenceremove - Trim silence from start/end

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
    input_path = os.path.join(SOURCE_DIR, filename)
    base_name = os.path.splitext(filename)[0]
    output_path = os.path.join(OUTPUT_DIR, f"{counter}.mp3")
    temp_wav = os.path.join(TEMP_DIR, f"{base_name}.wav")
    
    print(f"[{counter}/{len(files)}] Processing: {base_name}")
    
    try:
        # Step 1: Convert to WAV for processing
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-ar", "44100", "-ac", "2",
            temp_wav
        ], capture_output=True, check=True)
        
        # Step 2: Apply enhancement and convert to high-quality MP3
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
        # Clean up temp file
        if os.path.exists(temp_wav):
            os.remove(temp_wav)
    
    counter += 1

print(f"\n{'='*50}")
print(f"Done! Enhanced {success_count}/{len(files)} files")
print(f"Output: {OUTPUT_DIR}")
print(f"Files renamed to: 1.mp3, 2.mp3, 3.mp3, ...")

# Summary
enhanced_files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.mp3')]
total_size = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in enhanced_files)
print(f"Total enhanced audio: {total_size/1024/1024:.2f} MB")