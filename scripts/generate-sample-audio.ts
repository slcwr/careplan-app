/**
 * サンプル音声ファイル生成スクリプト
 * Google Cloud Text-to-Speech APIを使用してテキストから音声を生成します
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import * as fs from 'fs'
import * as path from 'path'

const client = new TextToSpeechClient()

interface AudioConfig {
  scriptPath: string
  outputPath: string
}

const audioConfigs: AudioConfig[] = [
  {
    scriptPath: 'public/samples/care-plan-script-1.txt',
    outputPath: 'public/samples/care-plan-sample-1.webm',
  },
  {
    scriptPath: 'public/samples/care-plan-script-2.txt',
    outputPath: 'public/samples/care-plan-sample-2.webm',
  },
]

async function generateAudio(config: AudioConfig) {
  try {
    // テキストファイルを読み込み
    const text = fs.readFileSync(config.scriptPath, 'utf-8')

    console.log(`Generating audio for: ${config.scriptPath}`)

    // Text-to-Speech APIリクエスト
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-C', // 日本語女性の声
        // その他の選択肢:
        // 'ja-JP-Neural2-B': 男性の声
        // 'ja-JP-Neural2-D': 男性の声
      },
      audioConfig: {
        audioEncoding: 'OGG_OPUS', // WEBM互換形式
        speakingRate: 1.0, // 話す速度（0.25〜4.0）
        pitch: 0.0, // 音程（-20.0〜20.0）
      },
    })

    // 音声データを保存
    if (response.audioContent) {
      fs.writeFileSync(config.outputPath, response.audioContent, 'binary')
      console.log(`✓ Audio saved to: ${config.outputPath}`)

      // ファイルサイズを表示
      const stats = fs.statSync(config.outputPath)
      console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`)
    }
  } catch (error) {
    console.error(`Error generating audio for ${config.scriptPath}:`, error)
  }
}

async function main() {
  console.log('Starting sample audio generation...\n')

  // Google Cloud認証情報の確認
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set')
    console.log('Please set it in your .env file or export it in your shell')
    process.exit(1)
  }

  // すべての音声ファイルを生成
  for (const config of audioConfigs) {
    await generateAudio(config)
    console.log('')
  }

  console.log('All sample audio files generated successfully!')
}

main().catch(console.error)
