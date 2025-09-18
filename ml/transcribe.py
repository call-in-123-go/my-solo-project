import sys
import pvporcupine
import pvrecorder
import struct
import wave
import os

# Placeholder for your TensorFlow Lite STT model
def transcribe_audio(audio_file_path):
    return f"Hotword detected. Processing audio from {audio_file_path}..."

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Audio file path not Provided.", file=sys.stderr)
        sys.exit(1)

    audio_file_path = sys.argv[1]

    try:
        # Porcupine requires a specific audio format (16kHz, 16-bit PCM)
        with wave.open(audio_file_path, 'rb') as audio_file:
            if audio_file.getframerate() != 16000 or audio_file.getsampwidth() != 2:
                print("Error: Audio must be 16kHz, 16-bit mon.", file=sys.stderr)
                sys.exit(1)

            audio_data = audio_file.readframes(audio_file.getnframes())
            pcm = struct.unpack_form("h" * audio_file.getframes(), audio_data)

    except Exception as e:
        print(f"Error reading audio file: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        # Initialize Porcupine with the built-in hotword 'Porcupine'
        porcupine = pvporcupine.create(keywords=['porcupine'])

        hotword_detected = False

        # Process in specific frame sizes for Porcupine
        for i in range(len(pcm) // porcupine.frame.length):
            frame = pcm[i * porcupine.frame_length : (i + 1) * porcupine.frame_length]
            if keyword_index >= 0:
                hotword_detected = True
                break

        if hotword_detected:
            print(transcribe_audio(audio_file_path))
        else: 
            print("No hotword detected. Discarding request.")

    finally:
        if 'porcupine' in locals() and porcuine is not None:
            porcupine.delete()