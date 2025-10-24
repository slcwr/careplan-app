// 録音ページ

import AudioRecorder from '@/app/components/AudioRecorder'

export default function RecordPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">音声録音</h1>
      <AudioRecorder />
    </div>
  )
}
