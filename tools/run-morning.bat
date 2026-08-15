@echo off
set PYTHONIOENCODING=utf-8
cd /d C:\Users\Hatem\Documents\azkar-app
python tools\transcribe-chunk.py morning
echo %ERRORLEVEL% > tools\morning-done.txt
