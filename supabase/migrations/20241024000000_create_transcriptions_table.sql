-- Create transcriptions table
CREATE TABLE IF NOT EXISTS public.transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  transcribed_text TEXT NOT NULL,
  audio_file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_transcriptions_user_id ON public.transcriptions(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON public.transcriptions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transcriptions" ON public.transcriptions;
DROP POLICY IF EXISTS "Users can insert their own transcriptions" ON public.transcriptions;
DROP POLICY IF EXISTS "Users can update their own transcriptions" ON public.transcriptions;
DROP POLICY IF EXISTS "Users can delete their own transcriptions" ON public.transcriptions;

-- Create policy to allow users to read their own transcriptions
CREATE POLICY "Users can view their own transcriptions"
  ON public.transcriptions
  FOR SELECT
  USING (user_id = auth.uid()::TEXT);

-- Create policy to allow users to insert their own transcriptions
CREATE POLICY "Users can insert their own transcriptions"
  ON public.transcriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Create policy to allow users to update their own transcriptions
CREATE POLICY "Users can update their own transcriptions"
  ON public.transcriptions
  FOR UPDATE
  USING (user_id = auth.uid()::TEXT);

-- Create policy to allow users to delete their own transcriptions
CREATE POLICY "Users can delete their own transcriptions"
  ON public.transcriptions
  FOR DELETE
  USING (user_id = auth.uid()::TEXT);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transcriptions_updated_at
  BEFORE UPDATE ON public.transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
