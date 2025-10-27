-- care_plan_reportsテーブルを更新して、clientsテーブルへの参照を追加

-- 1. 既存のcare_plan_reportsテーブルにclient_idカラムを追加
ALTER TABLE care_plan_reports ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 2. 不要になったカラムを削除（client_name, client_age, care_levelはclientsテーブルから参照）
ALTER TABLE care_plan_reports DROP COLUMN IF EXISTS client_name;
ALTER TABLE care_plan_reports DROP COLUMN IF EXISTS client_age;
ALTER TABLE care_plan_reports DROP COLUMN IF EXISTS care_level;

-- 3. インデックスを追加
CREATE INDEX IF NOT EXISTS idx_care_plan_reports_client_id ON care_plan_reports(client_id);

-- 4. コメントを追加
COMMENT ON COLUMN care_plan_reports.client_id IS '利用者への参照（clientsテーブル）';
