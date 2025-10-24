// 録音ページ

'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AudioRecorder from '@/app/components/AudioRecorder'

export default function RecordPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        音声録音
      </Typography>
      <AudioRecorder />
    </Box>
  )
}
