"""Edge TTS generator - accepts voice and rate as arguments."""
import sys
import asyncio
import edge_tts

DEFAULT_VOICE = "ar-SA-HamedNeural"
DEFAULT_RATE = "-20%"

async def generate(text, output_path, voice, rate):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(output_path)

def main():
    if len(sys.argv) < 3:
        sys.exit(1)
    text = sys.argv[1]
    output = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_VOICE
    rate = sys.argv[4] if len(sys.argv) > 4 else DEFAULT_RATE
    asyncio.run(generate(text, output, voice, rate))

if __name__ == "__main__":
    main()
