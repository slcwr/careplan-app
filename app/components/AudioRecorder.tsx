// components/AudioRecorder.tsx
'use client';

import { useState, useRef } from 'react';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // または 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        await transcribeAudio(audioBlob);
        
        // ストリーム停止
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('マイクへのアクセスが拒否されました');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', 'user-123'); // 実際のユーザーID

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setTranscription(data.transcription);
      } else {
        alert('文字起こしに失敗しました');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button
          onClick={startRecording}
          disabled={isRecording || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          🎤 録音開始
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          ⏹️ 録音停止
        </button>
      </div>

      {isRecording && (
        <div className="mb-4 text-red-500 font-bold">
          🔴 録音中...
        </div>
      )}

      {isLoading && (
        <div className="mb-4 text-blue-500">
          文字起こし処理中...
        </div>
      )}

      {transcription && (
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-bold mb-2">文字起こし結果:</h3>
          <p className="whitespace-pre-wrap">{transcription}</p>
        </div>
      )}
    </div>
  );
}