/**
 * Geminiによる構造化データ抽出のテストスクリプト
 * 使い方: npx tsx scripts/test-gemini-extraction.ts <conversation-file.txt>
 */

import * as fs from 'fs'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'

// .envファイルから環境変数を読み込み
dotenv.config()

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

async function extractCarePlan(conversationText: string) {
  const prompt = `
以下は、ケアマネージャーと利用者（またはその家族）との会話を文字起こししたテキストです。
この会話から居宅サービス計画書に必要な情報を抽出し、JSON形式で出力してください。

【会話テキスト】
${conversationText}

【抽出する情報】
1. 利用者基本情報
   - client_name: 利用者氏名
   - client_age: 年齢（数値）
   - care_level: 要介護度（例: 要介護1, 要介護2, 要支援1など）

2. 生活課題・目標
   - life_issues: 生活上の課題や困っていること
   - long_term_goal: 長期目標（期間も含む）
   - long_term_goal_period: 長期目標の期間

3. 短期目標（配列形式）
   - needs: 各短期目標のオブジェクト配列
     - content: 目標内容
     - period: 期間

4. サービス内容（配列形式）
   - services: 各サービスのオブジェクト配列
     - type: サービス種類（例: 訪問介護, 通所介護, 訪問看護など）
     - frequency: 頻度（例: 週3回, 週2回など）
     - details: 詳細内容

5. 福祉用具
   - equipment: 福祉用具の内容（文字列）

6. その他
   - remarks: 備考（緊急連絡先、家族構成、その他特記事項）

【出力形式】
必ず以下のJSON形式で出力してください。該当する情報がない項目はnullにしてください。

\`\`\`json
{
  "client_name": "氏名",
  "client_age": 年齢,
  "care_level": "要介護度",
  "life_issues": "生活課題",
  "long_term_goal": "長期目標",
  "long_term_goal_period": "期間",
  "needs": [
    {
      "content": "短期目標1",
      "period": "期間"
    }
  ],
  "services": [
    {
      "type": "サービス種類",
      "frequency": "頻度",
      "details": "詳細"
    }
  ],
  "equipment": "福祉用具",
  "remarks": "備考・緊急連絡先など"
}
\`\`\`

重要: JSON以外の説明文は一切出力せず、JSONのみを出力してください。
`

  console.log('🤖 Sending request to Gemini...\n')

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  // JSONを抽出
  let jsonText = text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '')
  }

  return JSON.parse(jsonText)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
使い方:
  npx tsx scripts/test-gemini-extraction.ts <conversation-file.txt>

例:
  npx tsx scripts/test-gemini-extraction.ts public/samples/conversation-1.txt

環境変数:
  GEMINI_API_KEY を .env ファイルに設定してください
`)
    process.exit(0)
  }

  const filePath = args[0]

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`)
    process.exit(1)
  }

  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is not set')
    console.log('💡 Please add it to your .env file')
    process.exit(1)
  }

  console.log('🚀 Starting Gemini extraction test...\n')
  console.log(`📖 Reading conversation from: ${filePath}`)

  const conversationText = fs.readFileSync(filePath, 'utf-8')
  console.log(`📝 Text length: ${conversationText.length} characters\n`)

  try {
    const extractedData = await extractCarePlan(conversationText)

    console.log('✅ Extraction successful!\n')
    console.log('📋 Extracted Care Plan Data:')
    console.log('━'.repeat(60))
    console.log(JSON.stringify(extractedData, null, 2))
    console.log('━'.repeat(60))

    // サマリーを表示
    console.log('\n📊 Summary:')
    console.log(`  利用者: ${extractedData.client_name || 'N/A'} (${extractedData.client_age || 'N/A'}歳)`)
    console.log(`  要介護度: ${extractedData.care_level || 'N/A'}`)
    console.log(`  短期目標数: ${extractedData.needs?.length || 0}`)
    console.log(`  サービス数: ${extractedData.services?.length || 0}`)

    console.log('\n✨ Done!')
  } catch (error) {
    console.error('\n❌ Error during extraction:', error)
    process.exit(1)
  }
}

main().catch(console.error)
