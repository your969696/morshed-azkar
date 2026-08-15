@echo off
set PYTHONIOENCODING=utf-8
cd /d C:\Users\Hatem\Documents\azkar-app
python tools\transcribe-chunk.py evening
echo %ERRORLEVEL% > tools\evening-done.txt
