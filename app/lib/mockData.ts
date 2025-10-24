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

  created_at: new Date('2024-10-20').toISOString(),
  updated_at: new Date('2024-10-20').toISOString(),
}

// レポート一覧用のモックデータ
export const mockCarePlanReports: CarePlanReport[] = [
  {
    ...mockCarePlanReport,
    id: 'report-001',
    client_name: '山田 太郎',
    client_age: 78,
    care_level: '要介護2',
    created_at: new Date('2024-10-20').toISOString(),
    updated_at: new Date('2024-10-20').toISOString(),
  } as CarePlanReport,
  {
    id: 'report-002',
    transcription_id: null,
    user_id: 'user-123',
    client_name: '佐藤 花子',
    client_age: 82,
    care_level: '要介護3',
    life_issues: '認知症の進行により、日常生活動作に見守りが必要',
    needs: ['認知症ケアの充実', '安全な生活環境の確保', '家族の介護負担軽減'],
    long_term_goal: '認知症の進行を緩やかにし、穏やかな日常生活を送る',
    short_term_goals: ['デイサービスでの活動に参加する', '服薬管理のサポートを受ける'],
    services: [
      {
        type: '訪問介護',
        provider: 'ひまわり介護サービス',
        frequency: '週5回',
        duration: '各回2時間、6ヶ月間',
      },
      {
        type: '認知症対応型デイサービス',
        provider: 'もみじデイサービスセンター',
        frequency: '週3回',
        duration: '各回5時間、6ヶ月間',
      },
    ],
    remarks: '家族との連携を密にして、安心できる環境づくりを心がける',
    created_at: new Date('2024-10-18').toISOString(),
    updated_at: new Date('2024-10-18').toISOString(),
  },
  {
    id: 'report-003',
    transcription_id: null,
    user_id: 'user-123',
    client_name: '鈴木 一郎',
    client_age: 75,
    care_level: '要介護1',
    life_issues: '脳卒中後のリハビリが必要',
    needs: ['歩行能力の回復', '日常生活動作の自立支援'],
    long_term_goal: '杖なしで歩行できるようになる',
    short_term_goals: ['リハビリを継続する', '筋力を維持する'],
    services: [
      {
        type: '訪問リハビリテーション',
        provider: 'さくらリハビリステーション',
        frequency: '週2回',
        duration: '各回60分、6ヶ月間',
      },
      {
        type: 'デイサービス',
        provider: 'すみれデイサービスセンター',
        frequency: '週1回',
        duration: '各回6時間、6ヶ月間',
      },
    ],
    remarks: '本人の意欲が高く、積極的にリハビリに取り組んでいる',
    created_at: new Date('2024-10-15').toISOString(),
    updated_at: new Date('2024-10-15').toISOString(),
  },
]
