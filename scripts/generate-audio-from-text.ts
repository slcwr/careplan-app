/**
 * テキストファイルから音声ファイルを生成するスクリプト
 * 使い方: npx tsx scripts/generate-audio-from-text.ts <input.txt> [output.webm]
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import * as fs from 'fs'
import * as path from 'path'

const client = new TextToSpeechClient()

async function generateAudioFromText(inputPath: string, outputPath?: string) {
  try {
    // 出力パスが指定されていない場合、入力ファイル名から生成
    if (!outputPath) {
      const parsedPath = path.parse(inputPath)
      outputPath = path.join(parsedPath.dir, `${parsedPath.name}.webm`)
    }

    // テキストファイルを読み込み
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Error: File not found: ${inputPath}`)
      process.exit(1)
    }

    const text = fs.readFileSync(inputPath, 'utf-8')
    console.log(`📖 Reading text from: ${inputPath}`)
    console.log(`📝 Text length: ${text.length} characters\n`)

    // Text-to-Speech APIリクエスト
    console.log('🎤 Generating audio...')
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-C', // 日本語女性の声
      },
      audioConfig: {
        audioEncoding: 'OGG_OPUS', // WEBM互換形式
        speakingRate: 1.0,
        pitch: 0.0,
      },
    })

    // 音声データを保存
    if (response.audioContent) {
      fs.writeFileSync(outputPath, response.audioContent, 'binary')
      const stats = fs.statSync(outputPath)

      console.log('✅ Success!')
      console.log(`📁 Output file: ${outputPath}`)
      console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`)

      // 推定再生時間（おおよその計算）
      const estimatedDuration = Math.round(text.length / 10) // 日本語は約10文字/秒
      console.log(`⏱️  Estimated duration: ~${estimatedDuration} seconds`)
    }
  } catch (error) {
    console.error('❌ Error generating audio:', error)
    process.exit(1)
  }
}

// コマンドライン引数を取得
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
使い方:
  npx tsx scripts/generate-audio-from-text.ts <input.txt> [output.webm]

例:
  npx tsx scripts/generate-audio-from-text.ts public/samples/my-script.txt
  npx tsx scripts/generate-audio-from-text.ts input.txt output.webm

オプション:
  input.txt   - 入力テキストファイル（必須）
  output.webm - 出力音声ファイル（省略可、デフォルトは入力ファイル名.webm）

環境変数:
  GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json を設定してください

音声設定:
  - 言語: 日本語 (ja-JP)
  - 音声: Neural2-C (女性)
  - 形式: WEBM (OPUS)
  - サンプルレート: 48kHz
`)
  process.exit(0)
}

const inputPath = args[0]
const outputPath = args[1]

// 認証情報の確認
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set')
  console.log('💡 Please run:')
  console.log('   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json npx tsx scripts/generate-audio-from-text.ts <input.txt>')
  process.exit(1)
}

console.log('🚀 Starting audio generation...\n')
generateAudioFromText(inputPath, outputPath)
  .then(() => {
    console.log('\n✨ Done!')
  })
  .catch(console.error)
