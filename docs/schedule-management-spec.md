# スケジュール管理機能 - 詳細仕様書

## 1. 概要
ケアマネージャーの訪問予定、モニタリング期限、ケアプラン更新時期を管理し、期限切れを防ぐための機能。

## 2. データベーススキーマ

### 2.1 clients テーブル（新規作成）
利用者の基本情報を管理

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- 基本情報
  name VARCHAR(100) NOT NULL,
  name_kana VARCHAR(100),
  birth_date DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(birth_date))) STORED,
  gender VARCHAR(10),

  -- 連絡先
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),

  -- 介護保険情報
  care_level VARCHAR(20), -- 要支援1, 要支援2, 要介護1-5
  insurance_number VARCHAR(50),
  certification_date DATE, -- 認定日
  certification_valid_from DATE, -- 認定有効期間開始
  certification_valid_to DATE,   -- 認定有効期間終了

  -- 緊急連絡先
  emergency_contact JSONB, -- {name, relation, phone, email}[]

  -- 担当情報
  primary_care_manager UUID REFERENCES auth.users(id),
  service_providers JSONB, -- サービス事業者のリスト

  -- メタデータ
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_care_level ON clients(care_level);
CREATE INDEX idx_clients_status ON clients(status);
```

### 2.2 schedules テーブル（新規作成）
訪問予定とイベントを管理

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id),

  -- イベント基本情報
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- visit, monitoring, meeting, assessment, other

  -- 日時
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,

  -- 場所
  location TEXT, -- 利用者宅、事業所、オンラインなど

  -- ステータス
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
  completion_notes TEXT, -- 実施後のメモ
  completed_at TIMESTAMPTZ,

  -- リマインダー設定
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time INTEGER DEFAULT 24, -- 何時間前に通知するか
  reminder_sent BOOLEAN DEFAULT false,

  -- 繰り返し設定
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB, -- {frequency: 'daily|weekly|monthly', interval: 1, endDate: '2024-12-31'}
  parent_schedule_id UUID REFERENCES schedules(id),

  -- 関連データ
  related_care_plan_id UUID REFERENCES care_plan_reports(id),
  attendees JSONB, -- 参加者リスト [{name, role, email}]

  -- メタデータ
  priority VARCHAR(20) DEFAULT 'normal', -- high, normal, low
  tags VARCHAR(50)[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_client_id ON schedules(client_id);
CREATE INDEX idx_schedules_start_time ON schedules(start_time);
CREATE INDEX idx_schedules_event_type ON schedules(event_type);
CREATE INDEX idx_schedules_status ON schedules(status);
```

### 2.3 alerts テーブル（新規作成）
自動生成されるアラート（期限管理）

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id),

  -- アラート情報
  alert_type VARCHAR(50) NOT NULL, -- monitoring_due, plan_renewal, certification_renewal, service_review
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- 期限
  due_date DATE NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- urgent, high, normal, low

  -- ステータス
  status VARCHAR(20) DEFAULT 'active', -- active, dismissed, completed, snoozed
  dismissed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,

  -- 通知
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,

  -- 関連データ
  related_schedule_id UUID REFERENCES schedules(id),
  related_care_plan_id UUID REFERENCES care_plan_reports(id),

  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_client_id ON alerts(client_id);
CREATE INDEX idx_alerts_due_date ON alerts(due_date);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
```

### 2.4 monitoring_records テーブル（新規作成）
モニタリング実施記録

```sql
CREATE TABLE monitoring_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  care_plan_id UUID REFERENCES care_plan_reports(id),
  schedule_id UUID REFERENCES schedules(id),

  -- モニタリング情報
  monitoring_date DATE NOT NULL,
  monitoring_type VARCHAR(50), -- regular, emergency, telephone, visit

  -- 実施内容
  service_usage_status TEXT, -- サービス利用状況
  health_condition TEXT, -- 健康状態
  living_condition TEXT, -- 生活状況
  family_situation TEXT, -- 家族状況

  -- 評価
  goal_achievement JSONB, -- 目標達成度 [{goal, status, notes}]
  issues TEXT[], -- 発生した問題
  improvements TEXT[], -- 改善事項

  -- 対応
  action_plan TEXT, -- 今後の対応方針
  plan_revision_needed BOOLEAN DEFAULT false,
  plan_revision_reason TEXT,

  -- 次回予定
  next_monitoring_date DATE,

  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monitoring_records_user_id ON monitoring_records(user_id);
CREATE INDEX idx_monitoring_records_client_id ON monitoring_records(client_id);
CREATE INDEX idx_monitoring_records_date ON monitoring_records(monitoring_date);
```

## 3. TypeScript型定義

```typescript
// app/lib/types.ts に追加

export interface Client {
  id: string
  user_id: string

  // 基本情報
  name: string
  name_kana?: string
  birth_date: string
  age: number
  gender?: string

  // 連絡先
  address?: string
  phone?: string
  email?: string

  // 介護保険情報
  care_level?: string
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

export interface EmergencyContact {
  name: string
  relation: string
  phone: string
  email?: string
}

export interface ServiceProvider {
  id: string
  name: string
  type: string
  contact: string
}

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

  // リレーション
  client?: Client
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
  daysOfWeek?: number[] // 0-6 (日-土)
}

export interface Attendee {
  name: string
  role: string
  email?: string
}

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

export interface GoalAchievement {
  goal: string
  status: 'achieved' | 'in_progress' | 'not_achieved'
  notes?: string
}
```

## 4. 自動アラート生成ロジック

### 4.1 モニタリング期限アラート
```typescript
// app/lib/alerts/monitoring-alerts.ts

import { Client, Alert } from '../types'
import { addMonths, isBefore, differenceInDays } from 'date-fns'

export function generateMonitoringAlert(client: Client): Alert | null {
  const lastMonitoring = getLastMonitoringDate(client.id)
  const careLevel = client.care_level

  // 要介護: 6ヶ月、要支援: 3ヶ月
  const monthsToAdd = careLevel?.includes('要支援') ? 3 : 6
  const dueDate = addMonths(lastMonitoring, monthsToAdd)

  // 期限の2週間前からアラート
  const alertDate = addMonths(lastMonitoring, monthsToAdd - 0.5)

  if (isBefore(new Date(), alertDate)) {
    return null // まだアラート不要
  }

  const daysRemaining = differenceInDays(dueDate, new Date())
  const priority = daysRemaining <= 7 ? 'urgent' :
                   daysRemaining <= 14 ? 'high' : 'normal'

  return {
    alert_type: 'monitoring_due',
    title: `${client.name}様のモニタリング期限が近づいています`,
    description: `期限: ${formatDate(dueDate)} (残り${daysRemaining}日)`,
    due_date: dueDate,
    priority,
    client_id: client.id,
    status: 'active'
  }
}
```

### 4.2 ケアプラン更新アラート
```typescript
export function generatePlanRenewalAlert(client: Client): Alert | null {
  const certificationValidTo = new Date(client.certification_valid_to)

  // 認定有効期間終了の1ヶ月前
  const dueDate = addMonths(certificationValidTo, -1)
  const daysRemaining = differenceInDays(dueDate, new Date())

  if (daysRemaining < 0) {
    return null
  }

  const priority = daysRemaining <= 7 ? 'urgent' : 'high'

  return {
    alert_type: 'plan_renewal',
    title: `${client.name}様のケアプラン更新が必要です`,
    description: `認定有効期間終了: ${formatDate(certificationValidTo)}`,
    due_date: dueDate,
    priority,
    client_id: client.id,
    status: 'active'
  }
}
```

### 4.3 認定更新申請アラート
```typescript
export function generateCertificationRenewalAlert(client: Client): Alert | null {
  const certificationValidTo = new Date(client.certification_valid_to)

  // 60日前に申請必要
  const dueDate = addDays(certificationValidTo, -60)
  const daysRemaining = differenceInDays(dueDate, new Date())

  if (daysRemaining < 0 || daysRemaining > 90) {
    return null
  }

  const priority = daysRemaining <= 14 ? 'urgent' : 'high'

  return {
    alert_type: 'certification_renewal',
    title: `${client.name}様の認定更新申請期限が近づいています`,
    description: `申請期限: ${formatDate(dueDate)} (認定有効期間: ${formatDate(certificationValidTo)})`,
    due_date: dueDate,
    priority,
    client_id: client.id,
    status: 'active'
  }
}
```

## 5. UI/UX設計

### 5.1 カレンダービュー
```
┌─────────────────────────────────────────────────┐
│ 📅 スケジュール                [月] [週] [日]    │
├─────────────────────────────────────────────────┤
│                   2024年 1月                     │
│ 日  月  火  水  木  金  土                        │
├─────────────────────────────────────────────────┤
│     1   2   3   4   5   6                       │
│ 7   8   9  10  11  12  13                       │
│        📍  🔔      📍                            │
│                                                 │
│ 14  15  16  17  18  19  20                      │
│ 📍      📍  🔔                                   │
└─────────────────────────────────────────────────┘

凡例:
📍 訪問予定
🔔 モニタリング期限
⚠️  緊急・優先度高
```

### 5.2 アラート一覧
```
┌─────────────────────────────────────────────────┐
│ 🔔 アラート               [すべて] [未対応のみ]  │
├─────────────────────────────────────────────────┤
│ ⚠️  田中太郎様 - モニタリング期限 (残り3日)      │
│     2024-01-15                                  │
│     [スケジュール登録] [完了]                    │
├─────────────────────────────────────────────────┤
│ 🔔  佐藤花子様 - ケアプラン更新 (残り14日)       │
│     2024-01-22                                  │
│     [プラン作成] [スヌーズ]                      │
└─────────────────────────────────────────────────┘
```

### 5.3 予定登録フォーム
```
┌─────────────────────────────────────────────────┐
│ 新規予定登録                             [✕]    │
├─────────────────────────────────────────────────┤
│ タイトル: [                                  ]  │
│ 利用者:   [田中太郎 ▼]                          │
│ 種類:     [○訪問 ○モニタリング ○会議 ○その他]  │
│                                                 │
│ 日時:     [2024-01-15] [10:00] - [11:00]       │
│ 場所:     [利用者宅                          ]  │
│                                                 │
│ リマインダー: [✓] [24]時間前に通知              │
│ 繰り返し:     [✓] [毎月 ▼] [15日]              │
│                                                 │
│ メモ:                                           │
│ [                                             ] │
│                                                 │
│                         [キャンセル] [登録]     │
└─────────────────────────────────────────────────┘
```

## 6. API設計

### 6.1 スケジュール関連API
```typescript
// GET /api/schedules?from=2024-01-01&to=2024-01-31
// レスポンス: Schedule[]

// POST /api/schedules
// リクエスト: Partial<Schedule>

// PUT /api/schedules/:id
// リクエスト: Partial<Schedule>

// DELETE /api/schedules/:id

// POST /api/schedules/:id/complete
// 予定を完了にする
```

### 6.2 アラート関連API
```typescript
// GET /api/alerts?status=active
// レスポンス: Alert[]

// POST /api/alerts/generate
// 全利用者のアラートを自動生成

// PUT /api/alerts/:id/dismiss
// アラートを非表示

// PUT /api/alerts/:id/snooze
// リクエスト: { snoozedUntil: string }
```

### 6.3 利用者関連API
```typescript
// GET /api/clients
// レスポンス: Client[]

// POST /api/clients
// リクエスト: Partial<Client>

// GET /api/clients/:id/upcoming-alerts
// その利用者の今後のアラート一覧
```

## 7. 実装順序

### Phase 1: 基本機能（2週間）
1. ✅ データベーステーブル作成
2. ✅ TypeScript型定義
3. ✅ 利用者管理画面
4. ✅ スケジュール登録・一覧表示

### Phase 2: カレンダー表示（1週間）
5. ✅ カレンダーUIコンポーネント（react-big-calendar）
6. ✅ ドラッグ&ドロップ対応
7. ✅ 月・週・日表示切り替え

### Phase 3: アラート機能（1週間）
8. ✅ 自動アラート生成ロジック
9. ✅ アラート一覧表示
10. ✅ アラートからスケジュール登録

### Phase 4: 通知機能（1週間）
11. ✅ メール通知実装
12. ✅ アプリ内通知
13. ✅ バッチ処理（毎日自動実行）

### Phase 5: 高度な機能（2週間）
14. ✅ 繰り返し予定
15. ✅ モニタリング記録機能
16. ✅ レポート・統計

## 8. 技術スタック

- **カレンダーUI**: react-big-calendar または FullCalendar
- **日付処理**: date-fns
- **通知**: Resend (メール) / Web Push API
- **バッチ処理**: Vercel Cron Jobs または Supabase Edge Functions
- **状態管理**: React Query (キャッシング)

## 9. パフォーマンス考慮

- スケジュールデータのページネーション（月単位で取得）
- アラートの事前生成（毎日深夜にバッチ実行）
- インデックス最適化（日付・ユーザーID）
- React Queryでキャッシング
