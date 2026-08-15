"""Edge TTS generator - lightweight, needs internet but no model files."""
import sys
import asyncio
import edge_tts

VOICE = "ar-SA-HamedNeural"
RATE = "-5%"

async def generate(text, output_path):
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(output_path)

def main():
    if len(sys.argv) < 3:
        sys.exit(1)
    text = sys.argv[1]
    output = sys.argv[2]
    asyncio.run(generate(text, output))

if __name__ == "__main__":
    main()
