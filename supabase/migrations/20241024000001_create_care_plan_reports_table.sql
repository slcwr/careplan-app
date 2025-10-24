-- Create care_plan_reports table
CREATE TABLE IF NOT EXISTS public.care_plan_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transcription_id UUID REFERENCES public.transcriptions(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,

  -- 基本情報
  client_name TEXT NOT NULL,
  client_age INTEGER,
  care_level TEXT,

  -- 生活課題・ニーズ
  life_issues TEXT,
  needs JSONB DEFAULT '[]'::JSONB,

  -- 目標
  long_term_goal TEXT,
  short_term_goals JSONB DEFAULT '[]'::JSONB,

  -- サービス内容
  services JSONB DEFAULT '[]'::JSONB,

  -- その他
  remarks TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_care_plan_reports_user_id ON public.care_plan_reports(user_id);

-- Create index on transcription_id for faster queries
CREATE INDEX IF NOT EXISTS idx_care_plan_reports_transcription_id ON public.care_plan_reports(transcription_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_care_plan_reports_created_at ON public.care_plan_reports(created_at DESC);

-- Create index on client_name for searching
CREATE INDEX IF NOT EXISTS idx_care_plan_reports_client_name ON public.care_plan_reports(client_name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.care_plan_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own care plan reports" ON public.care_plan_reports;
DROP POLICY IF EXISTS "Users can insert their own care plan reports" ON public.care_plan_reports;
DROP POLICY IF EXISTS "Users can update their own care plan reports" ON public.care_plan_reports;
DROP POLICY IF EXISTS "Users can delete their own care plan reports" ON public.care_plan_reports;

-- Create policy to allow users to read their own reports
CREATE POLICY "Users can view their own care plan reports"
  ON public.care_plan_reports
  FOR SELECT
  USING (user_id = auth.uid()::TEXT);

-- Create policy to allow users to insert their own reports
CREATE POLICY "Users can insert their own care plan reports"
  ON public.care_plan_reports
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Create policy to allow users to update their own reports
CREATE POLICY "Users can update their own care plan reports"
  ON public.care_plan_reports
  FOR UPDATE
  USING (user_id = auth.uid()::TEXT);

-- Create policy to allow users to delete their own reports
CREATE POLICY "Users can delete their own care plan reports"
  ON public.care_plan_reports
  FOR DELETE
  USING (user_id = auth.uid()::TEXT);

-- Create updated_at trigger
CREATE TRIGGER update_care_plan_reports_updated_at
  BEFORE UPDATE ON public.care_plan_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.care_plan_reports IS '居宅サービス計画書（ケアプラン）';
COMMENT ON COLUMN public.care_plan_reports.transcription_id IS '関連する文字起こしID（任意）';
COMMENT ON COLUMN public.care_plan_reports.needs IS 'ニーズの配列 (例: ["移動支援", "食事介助"])';
COMMENT ON COLUMN public.care_plan_reports.short_term_goals IS '短期目標の配列 (例: ["歩行訓練", "日常生活の自立"])';
COMMENT ON COLUMN public.care_plan_reports.services IS 'サービス内容の配列 (例: [{"type": "訪問介護", "provider": "○○事業所", "frequency": "週3回", "duration": "3ヶ月"}])';
