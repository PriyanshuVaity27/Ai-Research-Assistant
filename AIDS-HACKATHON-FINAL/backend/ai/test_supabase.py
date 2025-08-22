from audio_component import AudioProcessor

processor = AudioProcessor()
audio_file = "../ai/recordings/audio_20250327_015021.wav"  # Replace with the actual path
text = processor.transcribe_audio(audio_file)
print(f"Transcription: {text}")