// components/AudioRecorder.tsx
'use client'

import { useState, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MicIcon from '@mui/icons-material/Mic'
import StopIcon from '@mui/icons-material/Stop'
import ReportViewer from './reports/ReportViewer'
import { mockCarePlanReport } from '@/app/lib/mockData'
import { CarePlanReport } from '@/app/lib/types'

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })
        await transcribeAudio(audioBlob)

        // ストリーム停止
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setShowReport(false)
    } catch (error) {
      console.error('Recording error:', error)
      alert('マイクへのアクセスが拒否されました')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true)
    try {
      // モック: 実際のAPI呼び出しの代わりにモックデータを表示
      // 実際の実装では以下のコードを使用
      /*
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('userId', 'user-123')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setTranscription(data.transcription)
      } else {
        alert('文字起こしに失敗しました')
      }
      */

      // モック処理（2秒待機してからモックデータを表示）
      await new Promise(resolve => setTimeout(resolve, 2000))

      setTranscription('音声認識が完了しました。居宅サービス計画書を生成しました。')
      setShowReport(true)
    } catch (error) {
      console.error('Transcription error:', error)
      alert('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MicIcon />}
          onClick={startRecording}
          disabled={isRecording || isLoading}
          size="large"
        >
          録音開始
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<StopIcon />}
          onClick={stopRecording}
          disabled={!isRecording}
          size="large"
        >
          録音停止
        </Button>
      </Box>

      {isRecording && (
        <Alert severity="error" sx={{ mb: 3 }}>
          🔴 録音中...
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={24} />
          <Alert severity="info" sx={{ flexGrow: 1 }}>
            文字起こし処理中...
          </Alert>
        </Box>
      )}

      {transcription && !showReport && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {transcription}
        </Alert>
      )}

      {showReport && (
        <Box sx={{ mt: 4 }}>
          <ReportViewer report={mockCarePlanReport as CarePlanReport} />
        </Box>
      )}
    </Box>
  )
}
