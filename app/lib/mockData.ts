// モックデータ

import { CarePlanReport } from './types'

export const mockCarePlanReport: Partial<CarePlanReport> = {
  id: 'mock-001',
  transcription_id: null,
  user_id: 'user-123',

  // 基本情報
  client_name: '山田 太郎',
  client_age: 78,
  care_level: '要介護2',

  // 生活課題・ニーズ
  life_issues: `
・歩行が不安定で転倒のリスクがある
・日常生活動作（ADL）の一部に介助が必要
・社会的な交流が減少している
・食事の準備が困難になってきている
  `.trim(),
  needs: [
    '安全な歩行と移動の支援',
    '日常生活動作の維持・向上',
    '社会参加の機会の確保',
    '栄養バランスの取れた食事の確保',
  ],

  // 目標
  long_term_goal: '住み慣れた自宅で安全に生活を続け、地域社会との交流を保ちながら、できる限り自立した生活を送る',
  short_term_goals: [
    '転倒せずに室内を安全に移動できるようになる（3ヶ月）',
    '週2回以上の外出機会を持ち、他者との交流を図る（3ヶ月）',
    '栄養バランスの取れた食事を1日3食摂取できる（1ヶ月）',
  ],

  // サービス内容
  services: [
    {
      type: '訪問介護',
      provider: 'あおぞら介護サービス',
      frequency: '週3回（月・水・金）',
      duration: '各回1時間、6ヶ月間',
    },
    {
      type: 'デイサービス',
      provider: 'さくらデイサービスセンター',
      frequency: '週2回（火・木）',
      duration: '各回6時間、6ヶ月間',
    },
    {
      type: '福祉用具貸与',
      provider: 'ケア用品レンタル株式会社',
      frequency: '継続',
      duration: '歩行器、6ヶ月間',
    },
    {
      type: '訪問リハビリテーション',
      provider: 'みどり訪問リハビリステーション',
      frequency: '週1回',
      duration: '各回40分、6ヶ月間',
    },
  ],

  // その他
  remarks: `
【留意事項】
・血圧が高めのため、サービス提供時には体調確認を十分に行うこと
・膝に痛みがあるため、歩行時は無理のないペースで進めること
・服薬管理は本人で可能だが、声かけによる確認を行うこと

【家族の意向】
・できるだけ自宅での生活を継続したい
・週末は家族が様子を見に来る予定

【本人の意向】
・友人と会う機会を持ちたい
・趣味の園芸を続けたい
  `.trim(),

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
