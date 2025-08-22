let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let stream;

const recordBtn = document.getElementById('record-btn');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const statusDiv = document.getElementById('status');

statusDiv.textContent = 'Ready to record.';

// Function to convert audio buffer to WAV format
function audioBufferToWav(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numChannels * 2; // 2 bytes per sample (16-bit)
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF'); // Chunk ID
    view.setUint32(4, 36 + length, true); // Chunk size
    writeString(8, 'WAVE'); // Format
    writeString(12, 'fmt '); // Subchunk1 ID
    view.setUint32(16, 16, true); // Subchunk1 size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * numChannels * 2, true); // Byte rate
    view.setUint16(32, numChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data'); // Subchunk2 ID
    view.setUint32(40, length, true); // Subchunk2 size

    // Write PCM data
    const floatTo16BitPCM = (output, offset, input) => {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };

    if (numChannels === 1) {
        floatTo16BitPCM(view, 44, audioBuffer.getChannelData(0));
    } else {
        // Interleave channels if stereo
        const interleaved = new Float32Array(audioBuffer.length * numChannels);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                interleaved[i * numChannels + channel] = channelData[i];
            }
        }
        floatTo16BitPCM(view, 44, interleaved);
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            // Request microphone access
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create a MediaRecorder instance
            mediaRecorder = new MediaRecorder(stream);

            // Reset audio chunks
            audioChunks = [];

            // Collect audio data as it's recorded
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            // When recording stops, process the audio
            mediaRecorder.onstop = async () => {
                // Create a Blob from the recorded chunks (audio/webm)
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                // Convert audio/webm to WAV
                try {
                    // Create an AudioContext to decode the audio
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

                    // Read the audio Blob as an ArrayBuffer
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    // Convert the AudioBuffer to WAV
                    const wavBlob = audioBufferToWav(audioBuffer);

                    // Create FormData to send the WAV audio to the server
                    const formData = new FormData();
                    formData.append('audio', wavBlob, 'recording.wav');

                    statusDiv.textContent = 'Processing audio...';
                    try {
                        const response = await fetch('/process_audio', {
                            method: 'POST',
                            body: formData
                        });
                        const result = await response.json();

                        if (result.error) {
                            statusDiv.textContent = `Error: ${result.error}`;
                        } else {
                            userInput.value = result.transcribed_text;
                            statusDiv.textContent = `Audio processed. Saved at: ${result.audio_path}`;

                            const messageDiv = document.createElement('div');
                            messageDiv.className = 'message user-message';
                            messageDiv.textContent = result.transcribed_text;
                            chatBox.appendChild(messageDiv);

                            const botMessageDiv = document.createElement('div');
                            botMessageDiv.className = 'message bot-message';
                            botMessageDiv.textContent = `You said: ${result.transcribed_text}`;
                            chatBox.appendChild(botMessageDiv);
                            chatBox.scrollTop = chatBox.scrollHeight;
                        }
                    } catch (error) {
                        statusDiv.textContent = `Error processing audio: ${error.message}`;
                        console.error('Audio processing error:', error);
                    }

                    // Clean up AudioContext
                    await audioContext.close();
                } catch (error) {
                    statusDiv.textContent = `Error converting audio to WAV: ${error.message}`;
                    console.error('WAV conversion error:', error);
                }

                // Clean up: stop all tracks and reset
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                audioChunks = [];
            };

            // Start recording
            mediaRecorder.start();
            recordBtn.textContent = '⏹️ Stop';
            recordBtn.classList.add('recording');
            statusDiv.textContent = 'Recording...';
            isRecording = true;
        } catch (error) {
            statusDiv.textContent = `Error accessing microphone: ${error.message}`;
            console.error('Microphone access error:', error);
        }
    } else {
        // Stop recording
        mediaRecorder.stop();
        recordBtn.textContent = '🎙️ Record';
        recordBtn.classList.remove('recording');
        isRecording = false;
    }
});

sendBtn.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);

        userInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        setTimeout(() => {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot-message';
            botMessageDiv.textContent = `You said: ${message}`;
            chatBox.appendChild(botMessageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 500);
    } else {
        statusDiv.textContent = 'Please enter a message.';
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});