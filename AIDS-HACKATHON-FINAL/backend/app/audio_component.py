import os
import wave
import json
import numpy as np
from datetime import datetime
from vosk import Model, KaldiRecognizer
from sklearn.feature_extraction.text import TfidfVectorizer
import tensorflow as tf
import tensorflow_hub as hub
import resampy
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AudioProcessor:
    def __init__(self, model_path=None, recordings_dir="recordings"):
        self.model_path = model_path or os.getenv("VOSK_MODEL_PATH", "D:/vosk-model-en-in-0.5")
        self.recordings_dir = recordings_dir

        if not os.path.exists(self.recordings_dir):
            os.makedirs(self.recordings_dir)

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model path '{self.model_path}' does not exist.")

        try:
            self.model = Model(self.model_path)
        except Exception as e:
            print(f"Failed to load model: {str(e)}")
            raise

        self.vectorizer = TfidfVectorizer()
        self.recognizer = None
        self.sample_rate = 16000
        self.current_transcription = []

        # Load VGGish model
        try:
            self.vggish_model = hub.load('https://tfhub.dev/google/vggish/1')
            self.vggish_sample_rate = 16000
        except Exception as e:
            print(f"Failed to load VGGish model: {str(e)}")
            self.vggish_model = None

        # Store Supabase credentials
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL or Key not found in environment variables.")

    def transcribe_audio(self, audio_file):
        print(f"Opening audio file: {audio_file}")
        try:
            wf = wave.open(audio_file, "rb")
            print(f"Audio file details: channels={wf.getnchannels()}, sampwidth={wf.getsampwidth()}, framerate={wf.getframerate()}")
            
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
                print("Audio file does not meet requirements: must be WAV format, mono, 16-bit, 16000 Hz")
                wf.close()
                return ""

            rec = KaldiRecognizer(self.model, wf.getframerate())
            rec.SetWords(True)

            transcribed_text = []
            print("Reading audio frames...")
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    text = result.get("text", "")
                    print(f"Partial transcription: {text}")
                    if text:
                        transcribed_text.append(text)

            final_result = json.loads(rec.FinalResult())
            text = final_result.get("text", "")
            print(f"Final transcription: {text}")
            if text:
                transcribed_text.append(text)

            wf.close()
            return " ".join(transcribed_text)
        except Exception as e:
            print(f"Error in transcribe_audio: {str(e)}")
            return ""

    def transcribe_stream(self, pcm_data):
        print("Starting transcribe_stream")
        try:
            if self.recognizer is None:
                print("Initializing recognizer")
                self.recognizer = KaldiRecognizer(self.model, self.sample_rate)
                self.recognizer.SetWords(True)

            print(f"Processing PCM data: {len(pcm_data)} bytes")
            if self.recognizer.AcceptWaveform(pcm_data):
                result = json.loads(self.recognizer.Result())
                text = result.get("text", "")
                print(f"Full result: {text}")
                if text:
                    self.current_transcription.append(text)
                    return " ".join(self.current_transcription)

            partial_result = json.loads(self.recognizer.PartialResult())
            partial_text = partial_result.get("partial", "")
            print(f"Partial result: {partial_text}")
            if partial_text:
                return " ".join(self.current_transcription) + " " + partial_text if self.current_transcription else partial_text
            return None
        except Exception as e:
            print(f"Error in transcribe_stream: {str(e)}")
            return None

    def reset_recognizer(self):
        self.recognizer = None
        self.current_transcription = []

    def create_tfidf_embedding(self, text):
        print(f"Text for TF-IDF: {text}")
        if not text:
            print("No text for TF-IDF embedding")
            return None
        try:
            embedding = self.vectorizer.fit_transform([text])
            return embedding.toarray()[0]
        except Exception as e:
            print(f"Error in create_tfidf_embedding: {str(e)}")
            return None

    def create_audio_embedding(self, audio_file):
        if self.vggish_model is None:
            print("VGGish model not loaded, skipping audio embedding")
            return None
        print(f"Creating audio embedding for {audio_file}")
        try:
            wf = wave.open(audio_file, "rb")
            sample_rate = wf.getframerate()
            print(f"Audio sample rate: {sample_rate}")
            audio_data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
            wf.close()

            if sample_rate != self.vggish_sample_rate:
                print(f"Resampling audio from {sample_rate} Hz to {self.vggish_sample_rate} Hz")
                audio_data = resampy.resample(audio_data, sample_rate, self.vggish_sample_rate)

            min_samples = self.vggish_sample_rate
            if len(audio_data) < min_samples:
                print(f"Padding audio data: {len(audio_data)} samples to {min_samples} samples")
                audio_data = np.pad(audio_data, (0, min_samples - len(audio_data)), mode='constant')

            print("Generating VGGish embedding...")
            embedding = self.vggish_model(audio_data)
            print("VGGish embedding generated")
            return embedding.numpy().mean(axis=0)
        except Exception as e:
            print(f"Error in create_audio_embedding: {str(e)}")
            return None

    def store_in_supabase(self, text, tfidf_embedding, audio_embedding, audio_path):
    # Prepare the data to send to Supabase
        data = {
            "transcribed_text": text if text else "",  # Ensure text is not None
            "tfidf_embedding": tfidf_embedding.tolist() if tfidf_embedding is not None else [],
            "audio_embedding": audio_embedding.tolist() if audio_embedding is not None else [],
            "audio_path": audio_path if audio_path else ""
        }
        print("Data being inserted into Supabase:", data)

        url = f"{self.supabase_url}/rest/v1/audio_records"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"  # Ensure Supabase returns the inserted record
        }

        try:
            response = requests.post(url, headers=headers, json=data)
            print("Status Code:", response.status_code)
            print("Response Text:", response.text)  # Log the raw response text

        # Check if the response is successful
            if response.status_code == 201:
            # Try to parse the response as JSON
                try:
                    response_data = response.json()
                    print("Successfully inserted data into Supabase:", response_data)
                    return response_data
                except ValueError as json_error:
                    print(f"Failed to parse Supabase response as JSON: {str(json_error)}")
                    print("Raw response:", response.text)
                    raise Exception(f"Supabase response is not valid JSON: {response.text}")
            else:
            # Log the error response
                print(f"Failed to insert data into Supabase: Status {response.status_code}, Response: {response.text}")
                raise Exception(f"Supabase request failed: Status {response.status_code}, Response: {response.text}")
        except requests.RequestException as e:
            print(f"Request to Supabase failed: {str(e)}")
            raise Exception(f"Failed to insert data into Supabase: {str(e)}")

    def process_audio(self, audio_file):
        print("Starting process_audio")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_path = os.path.join(self.recordings_dir, f"audio_{timestamp}.wav")
        
        print(f"Saving audio file to {audio_path}")
        with open(audio_path, "wb") as f:
            f.write(audio_file.read())

        print("Transcribing audio...")
        text = self.transcribe_audio(audio_path)
        print(f"Transcription result: {text}")
        if not text:
            print("Transcription failed: no text returned")
            return None, None, None, audio_path

        print("Creating TF-IDF embedding...")
        tfidf_embedding = self.create_tfidf_embedding(text)
        print(f"TF-IDF embedding: {tfidf_embedding}")

        print("Creating audio embedding...")
        audio_embedding = self.create_audio_embedding(audio_path)
        print(f"Audio embedding: {audio_embedding}")
        
        print("Storing in Supabase...")
        result = self.store_in_supabase(text, tfidf_embedding, audio_embedding, audio_path)
        print("Stored in Supabase successfully:", result)

        return text, tfidf_embedding, audio_embedding, audio_path