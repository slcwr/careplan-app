import AudioRecorder from './components/AudioRecorder'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ケアプラン録音システム
        </h1>
        <AudioRecorder />
      </div>
    </main>
  )
}