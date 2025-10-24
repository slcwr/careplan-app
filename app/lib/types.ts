// 型定義

export interface Transcription {
  id: string
  user_id: string
  transcribed_text: string
  audio_file_name: string | null
  created_at: string
  updated_at: string
}

export interface CarePlanReport {
  id: string
  transcription_id: string | null
  user_id: string

  // 基本情報
  client_name: string
  client_age: number | null
  care_level: string | null // 要介護度

  // 生活課題・ニーズ
  life_issues: string | null
  needs: string[]

  // 目標
  long_term_goal: string | null
  short_term_goals: string[]

  // サービス内容
  services: ServiceItem[]

  // その他
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface ServiceItem {
  type: string        // サービス種類
  provider: string    // 事業者
  frequency: string   // 頻度
  duration: string    // 期間
}
