/**
 * Google Gemini API を使用して文字起こしテキストから構造化データを抽出
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { CarePlanReport } from './types'

// Gemini API クライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Gemini 2.0 Flash モデルを使用
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

/**
 * ケアマネと利用者の会話から居宅サービス計画書の情報を抽出
 */
export async function extractCarePlanFromTranscription(
  transcriptionText: string
): Promise<Partial<CarePlanReport>> {
  const prompt = `
以下は、ケアマネージャーと利用者（またはその家族）との会話を文字起こししたテキストです。
この会話から居宅サービス計画書に必要な情報を抽出し、JSON形式で出力してください。

【会話テキスト】
${transcriptionText}

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
    },
    {
      "content": "短期目標2",
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

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // JSONを抽出（コードブロックがある場合は除去）
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '')
    }

    const extractedData = JSON.parse(jsonText)

    // データの型を整形
    const carePlanData: Partial<CarePlanReport> = {
      client_name: extractedData.client_name || null,
      client_age: extractedData.client_age ? parseInt(extractedData.client_age) : null,
      care_level: extractedData.care_level || null,
      life_issues: extractedData.life_issues || null,
      long_term_goal: extractedData.long_term_goal || null,
      long_term_goal_period: extractedData.long_term_goal_period || null,
      needs: extractedData.needs || [],
      services: extractedData.services || [],
      equipment: extractedData.equipment || null,
      remarks: extractedData.remarks || null,
    }

    return carePlanData
  } catch (error) {
    console.error('Error extracting care plan data with Gemini:', error)
    throw new Error('Failed to extract structured data from transcription')
  }
}

/**
 * テスト用: テキストファイルから直接抽出
 */
export async function testExtraction(filePath: string) {
  const fs = await import('fs')
  const text = fs.readFileSync(filePath, 'utf-8')
  return extractCarePlanFromTranscription(text)
}
