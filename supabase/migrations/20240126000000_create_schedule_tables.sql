-- スケジュール管理機能のテーブル作成

-- 1. clients テーブル: 利用者情報
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本情報
  name VARCHAR(100) NOT NULL,
  name_kana VARCHAR(100),
  birth_date DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('男性', '女性', 'その他', NULL)),

  -- 連絡先
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),

  -- 介護保険情報
  care_level VARCHAR(20) CHECK (care_level IN ('要支援1', '要支援2', '要介護1', '要介護2', '要介護3', '要介護4', '要介護5', NULL)),
  insurance_number VARCHAR(50),
  certification_date DATE,
  certification_valid_from DATE,
  certification_valid_to DATE,

  -- 緊急連絡先（JSONB配列）
  emergency_contact JSONB DEFAULT '[]'::jsonb,

  -- 担当情報
  primary_care_manager UUID REFERENCES auth.users(id),
  service_providers JSONB DEFAULT '[]'::jsonb,

  -- メタデータ
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_care_level ON clients(care_level);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_certification_valid_to ON clients(certification_valid_to);

-- 2. schedules テーブル: スケジュール・訪問予定
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- イベント基本情報
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('visit', 'monitoring', 'meeting', 'assessment', 'other')),

  -- 日時
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,

  -- 場所
  location TEXT,

  -- ステータス
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,

  -- リマインダー設定
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time INTEGER DEFAULT 24, -- 時間前
  reminder_sent BOOLEAN DEFAULT false,

  -- 繰り返し設定
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB,
  parent_schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,

  -- 関連データ
  related_care_plan_id UUID REFERENCES care_plan_reports(id) ON DELETE SET NULL,
  attendees JSONB DEFAULT '[]'::jsonb,

  -- メタデータ
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 制約: 終了時刻は開始時刻より後
  CONSTRAINT check_end_time_after_start CHECK (end_time > start_time)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_client_id ON schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules(start_time);
CREATE INDEX IF NOT EXISTS idx_schedules_end_time ON schedules(end_time);
CREATE INDEX IF NOT EXISTS idx_schedules_event_type ON schedules(event_type);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);

-- 3. alerts テーブル: アラート・期限管理
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- アラート情報
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('monitoring_due', 'plan_renewal', 'certification_renewal', 'service_review')),
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- 期限
  due_date DATE NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),

  -- ステータス
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'completed', 'snoozed')),
  dismissed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,

  -- 通知
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,

  -- 関連データ
  related_schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  related_care_plan_id UUID REFERENCES care_plan_reports(id) ON DELETE SET NULL,

  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_client_id ON alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_alerts_due_date ON alerts(due_date);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_alert_type ON alerts(alert_type);

-- 4. monitoring_records テーブル: モニタリング記録
CREATE TABLE IF NOT EXISTS monitoring_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  care_plan_id UUID REFERENCES care_plan_reports(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,

  -- モニタリング情報
  monitoring_date DATE NOT NULL,
  monitoring_type VARCHAR(50) CHECK (monitoring_type IN ('regular', 'emergency', 'telephone', 'visit', NULL)),

  -- 実施内容
  service_usage_status TEXT,
  health_condition TEXT,
  living_condition TEXT,
  family_situation TEXT,

  -- 評価
  goal_achievement JSONB DEFAULT '[]'::jsonb,
  issues TEXT[],
  improvements TEXT[],

  -- 対応
  action_plan TEXT,
  plan_revision_needed BOOLEAN DEFAULT false,
  plan_revision_reason TEXT,

  -- 次回予定
  next_monitoring_date DATE,

  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_monitoring_records_user_id ON monitoring_records(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_records_client_id ON monitoring_records(client_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_records_date ON monitoring_records(monitoring_date);

-- トリガー: updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_records_updated_at BEFORE UPDATE ON monitoring_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) ポリシー設定

-- clients テーブル
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- schedules テーブル
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON schedules FOR DELETE
  USING (auth.uid() = user_id);

-- alerts テーブル
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- monitoring_records テーブル
ALTER TABLE monitoring_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own monitoring records"
  ON monitoring_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monitoring records"
  ON monitoring_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monitoring records"
  ON monitoring_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monitoring records"
  ON monitoring_records FOR DELETE
  USING (auth.uid() = user_id);

-- コメント追加（ドキュメント目的）
COMMENT ON TABLE clients IS '利用者の基本情報と介護保険情報を管理';
COMMENT ON TABLE schedules IS '訪問予定やイベントのスケジュールを管理';
COMMENT ON TABLE alerts IS '期限管理のためのアラートを管理';
COMMENT ON TABLE monitoring_records IS 'モニタリング実施記録を管理';
