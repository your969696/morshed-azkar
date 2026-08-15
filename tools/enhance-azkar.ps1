# enhance-azkar.ps1 - Professional Audio Enhancement for Azkar
# Usage: .\enhance-azkar.ps1

$ErrorActionPreference = "Stop"

# Paths
$outputDir = "C:\Users\Hatem\Documents\azkar-app\public\azkar-voices"
$tempDir = "C:\Users\Hatem\Documents\azkar-app\tools\temp-enhance"

# Create output directories
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Get source directory using short path (8.3 format) to avoid Unicode issues
$shortPath = cmd /c "for %I in (""C:\Users\Hatem\Downloads\ذكر"") do @echo %~sI"
$files = [System.IO.Directory]::GetFiles($shortPath.Trim(), "*.mp3") | Sort-Object

Write-Host "Found $($files.Count) audio files to process" -ForegroundColor Cyan
Write-Host "Processing with studio-quality enhancement..." -ForegroundColor Green

# Counter for renamed files
$counter = 1

foreach ($inputPath in $files) {
    $fileName = [System.IO.Path]::GetFileName($inputPath)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($inputPath)
    $outputPath = Join-Path $outputDir "$counter.mp3"
    $tempPath = Join-Path $tempDir "$baseName.wav"
    
    Write-Host "Processing [$counter/$($files.Count)]: $baseName" -ForegroundColor Yellow
    
    # Step 1: Convert to WAV for processing
    & ffmpeg -y -i $inputPath -ar 44100 -ac 2 $tempPath 2>$null
    
    # Step 2: Apply professional audio enhancement chain
    $filters = "afftdn=nf=-25:nr=12:nt=w,anlmdn=s=7:r=0.002:m=15,highpass=f=80,lowpass=f=16000,equalizer=f=200:t=q:w=1:g=2,equalizer=f=3000:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=4:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11,silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB:stop_periods=1:stop_duration=0.1:stop_threshold=-40dB"
    
    # Apply enhancement and convert to high-quality MP3
    & ffmpeg -y -i $tempPath -af $filters -codec:a libmp3lame -b:a 192k -ar 44100 -ac 2 $outputPath 2>$null
    
    # Clean up temp file
    if (Test-Path $tempPath) { Remove-Item -Path $tempPath -Force }
    
    $counter++
}

Write-Host "`nDone! Enhanced $($files.Count) files to: $outputDir" -ForegroundColor Green
Write-Host "Files renamed to 1.mp3, 2.mp3, 3.mp3, ..." -ForegroundColor Cyan

# Summary
$enhancedFiles = Get-ChildItem -Path $outputDir -Filter "*.mp3"
$totalSize = ($enhancedFiles | Measure-Object -Property Length -Sum).Sum
Write-Host "Total enhanced audio: $([math]::Round($totalSize/1MB, 2)) MB" -ForegroundColor White