import React, { useState, useRef } from 'react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [output, setOutput] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');

        // Step 1: Send audio for transcription
        setOutput('Transcribing...');
        const transcribeResponse = await fetch('./api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const { text: transcribedText } = await transcribeResponse.json();
        setOutput(`Transcribed: "${transcribedText}"`);

        // Step 2: Send transcribed text to LLM for response
        setOutput('Getting LLM response');
        const llmResponse = await fetch('/api/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcribedText }),
        });
        const { text: llmText } = await llmResponse.json();
        setOutput(`LLM Says: "${llmText}"`);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone: ', error);
      setOutput('Error: Could not access microphone.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>{output}</p>
    </div>
  );
}

export default App;
