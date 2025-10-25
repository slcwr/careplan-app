/**
 * Google Gemini API (Function Calling) を使用して文字起こしテキストから構造化データを抽出
 */

import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from '@google/generative-ai'
import { CarePlanReport, NeedItem, ServiceItem } from './types'

// Function Calling の戻り値の型定義
interface ExtractedCarePlanData {
  client_name?: string
  client_age?: number
  care_level?: string
  life_issues?: string
  long_term_goal?: string
  long_term_goal_period?: string
  needs?: NeedItem[]
  services?: ServiceItem[]
  equipment?: string
  remarks?: string
}

// Gemini API クライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Function Calling用のスキーマ定義
const extractCarePlanFunction: FunctionDeclaration = {
  name: 'extract_care_plan',
  description: 'ケアマネージャーと利用者の会話から居宅サービス計画書の情報を抽出する',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      client_name: {
        type: SchemaType.STRING,
        description: '利用者の氏名',
      },
      client_age: {
        type: SchemaType.NUMBER,
        description: '利用者の年齢',
      },
      care_level: {
        type: SchemaType.STRING,
        description: '要介護度（例: 要介護1, 要介護2, 要支援1など）',
      },
      life_issues: {
        type: SchemaType.STRING,
        description: '生活上の課題や困っていること',
      },
      long_term_goal: {
        type: SchemaType.STRING,
        description: '長期目標',
      },
      long_term_goal_period: {
        type: SchemaType.STRING,
        description: '長期目標の期間',
      },
      needs: {
        type: SchemaType.ARRAY,
        description: '短期目標のリスト',
        items: {
          type: SchemaType.OBJECT,
          properties: {
            content: {
              type: SchemaType.STRING,
              description: '目標内容',
            },
            period: {
              type: SchemaType.STRING,
              description: '期間',
            },
          },
          required: ['content', 'period'],
        },
      },
      services: {
        type: SchemaType.ARRAY,
        description: 'サービス内容のリスト',
        items: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              description: 'サービス種類（例: 訪問介護, 通所介護, 訪問看護など）',
            },
            frequency: {
              type: SchemaType.STRING,
              description: '頻度（例: 週3回, 週2回など）',
            },
            details: {
              type: SchemaType.STRING,
              description: '詳細内容',
            },
          },
          required: ['type', 'frequency', 'details'],
        },
      },
      equipment: {
        type: SchemaType.STRING,
        description: '福祉用具',
      },
      remarks: {
        type: SchemaType.STRING,
        description: '備考（緊急連絡先、家族構成など）',
      },
    },
    required: ['client_name'],
  },
}

/**
 * ケアマネと利用者の会話から居宅サービス計画書の情報を抽出
 * Function Callingを使用して型安全に抽出
 */
export async function extractCarePlanFromTranscription(
  transcriptionText: string
): Promise<Partial<CarePlanReport>> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1, // 一貫性のある出力
      },
    })

    const chat = model.startChat({
      tools: [{ functionDeclarations: [extractCarePlanFunction] }],
    })

    const prompt = `
以下はケアマネージャーと利用者（またはその家族）の会話です。
この会話から居宅サービス計画書に必要な情報を抽出してください。

【会話内容】
${transcriptionText}

【注意事項】
- 会話に明記されていない情報は省略してください
- 数値は正確に抽出してください
- サービス内容は種類、頻度、詳細を具体的に記載してください
`

    const result = await chat.sendMessage(prompt)
    const response = result.response

    // Function Callの結果を取得
    const functionCalls = response.functionCalls()

    if (!functionCalls || functionCalls.length === 0) {
      console.error('No function call found in response')
      throw new Error('Failed to extract data: No function call returned')
    }

    const functionCall = functionCalls[0]

    if (functionCall.name !== 'extract_care_plan') {
      console.error('Unexpected function call:', functionCall.name)
      throw new Error('Failed to extract data: Unexpected function call')
    }

    // 抽出されたデータを型安全に返す
    const extractedData = functionCall.args as ExtractedCarePlanData

    // データの型を整形（必要に応じて）
    const carePlanData: Partial<CarePlanReport> = {
      client_name: extractedData.client_name,
      client_age: extractedData.client_age,
      care_level: extractedData.care_level,
      life_issues: extractedData.life_issues,
      long_term_goal: extractedData.long_term_goal,
      long_term_goal_period: extractedData.long_term_goal_period,
      needs: extractedData.needs,
      services: extractedData.services,
      equipment: extractedData.equipment,
      remarks: extractedData.remarks,
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
