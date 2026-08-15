import os, sys
sys.stdout.reconfigure(encoding='utf-8')

dist_dir = r"C:\Users\Hatem\Documents\azkar-app\dist"
abs_names = os.path.abspath(os.path.join(dist_dir, "names-voices"))
abs_azkar = os.path.abspath(os.path.join(dist_dir, "azkar-voices"))

print(f"Names voices exist: {os.path.isdir(abs_names)} ({len(os.listdir(abs_names))} files)")
print(f"Azkar voices exist: {os.path.isdir(abs_azkar)} ({len(os.listdir(abs_azkar))} files)")
print(f"Sample name: {os.path.join(abs_names, '1.mp3')} exists: {os.path.isfile(os.path.join(abs_names, '1.mp3'))}")
print(f"Sample azkar: {os.path.join(abs_azkar, '1.mp3')} exists: {os.path.isfile(os.path.join(abs_azkar, '1.mp3'))}")
