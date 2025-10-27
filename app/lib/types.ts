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
  client_id: string | null // 利用者への参照

  // 生活課題・ニーズ
  life_issues: string | null
  needs: NeedItem[]

  // 目標
  long_term_goal: string | null
  long_term_goal_period: string | null
  short_term_goals: string[]

  // サービス内容
  services: ServiceItem[]

  // 福祉用具
  equipment: string | null

  // その他
  remarks: string | null
  created_at: string
  updated_at: string

  // リレーション（フロントエンドで結合）
  client?: Client
}

export interface NeedItem {
  content: string  // 目標内容
  period: string   // 期間
}

export interface ServiceItem {
  type: string        // サービス種類
  frequency: string   // 頻度
  details: string     // 詳細内容
}

// ========================================
// スケジュール管理機能の型定義
// ========================================

// 利用者情報
export interface Client {
  id: string
  user_id: string

  // 基本情報
  name: string
  name_kana?: string
  birth_date: string
  gender?: '男性' | '女性' | 'その他'

  // 連絡先
  address?: string
  phone?: string
  email?: string

  // 介護保険情報
  care_level?: '要支援1' | '要支援2' | '要介護1' | '要介護2' | '要介護3' | '要介護4' | '要介護5'
  insurance_number?: string
  certification_date?: string
  certification_valid_from?: string
  certification_valid_to?: string

  // 緊急連絡先
  emergency_contact?: EmergencyContact[]

  // 担当情報
  primary_care_manager?: string
  service_providers?: ServiceProvider[]

  // メタデータ
  status: 'active' | 'inactive' | 'suspended'
  notes?: string
  created_at: string
  updated_at: string
}

// 緊急連絡先
export interface EmergencyContact {
  name: string
  relation: string
  phone: string
  email?: string
}

// サービス提供事業者
export interface ServiceProvider {
  id: string
  name: string
  type: string
  contact: string
}

// スケジュール
export interface Schedule {
  id: string
  user_id: string
  client_id?: string

  // イベント基本情報
  title: string
  description?: string
  event_type: 'visit' | 'monitoring' | 'meeting' | 'assessment' | 'other'

  // 日時
  start_time: string
  end_time: string
  all_day: boolean

  // 場所
  location?: string

  // ステータス
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  completion_notes?: string
  completed_at?: string

  // リマインダー
  reminder_enabled: boolean
  reminder_time: number
  reminder_sent: boolean

  // 繰り返し
  is_recurring: boolean
  recurrence_rule?: RecurrenceRule
  parent_schedule_id?: string

  // 関連データ
  related_care_plan_id?: string
  attendees?: Attendee[]

  // メタデータ
  priority: 'high' | 'normal' | 'low'
  tags?: string[]
  created_at: string
  updated_at: string

  // リレーション（フロントエンドで結合）
  client?: Client
}

// 繰り返し設定
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
  daysOfWeek?: number[] // 0-6 (日-土)
}

// 参加者
export interface Attendee {
  name: string
  role: string
  email?: string
}

// アラート
export interface Alert {
  id: string
  user_id: string
  client_id?: string

  // アラート情報
  alert_type: 'monitoring_due' | 'plan_renewal' | 'certification_renewal' | 'service_review'
  title: string
  description?: string

  // 期限
  due_date: string
  priority: 'urgent' | 'high' | 'normal' | 'low'

  // ステータス
  status: 'active' | 'dismissed' | 'completed' | 'snoozed'
  dismissed_at?: string
  snoozed_until?: string

  // 通知
  notification_sent: boolean
  notification_sent_at?: string

  // 関連データ
  related_schedule_id?: string
  related_care_plan_id?: string

  // メタデータ
  created_at: string
  updated_at: string

  // リレーション
  client?: Client
}

// モニタリング記録
export interface MonitoringRecord {
  id: string
  user_id: string
  client_id: string
  care_plan_id?: string
  schedule_id?: string

  // モニタリング情報
  monitoring_date: string
  monitoring_type?: 'regular' | 'emergency' | 'telephone' | 'visit'

  // 実施内容
  service_usage_status?: string
  health_condition?: string
  living_condition?: string
  family_situation?: string

  // 評価
  goal_achievement?: GoalAchievement[]
  issues?: string[]
  improvements?: string[]

  // 対応
  action_plan?: string
  plan_revision_needed: boolean
  plan_revision_reason?: string

  // 次回予定
  next_monitoring_date?: string

  // メタデータ
  created_at: string
  updated_at: string

  // リレーション
  client?: Client
}

// 目標達成度
export interface GoalAchievement {
  goal: string
  status: 'achieved' | 'in_progress' | 'not_achieved'
  notes?: string
}
