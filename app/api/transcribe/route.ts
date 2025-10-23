// app/api/transcribe/route.ts
import { SpeechClient } from '@google-cloud/speech';
import { createClient } from '@supabase/supabase-js';

const speechClient = new SpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const userId = formData.get('userId') as string;

    // 音声ファイルをバッファに変換
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer).toString('base64');

    // Speech-to-Text API呼び出し
    const [response] = await speechClient.recognize({
      config: {
        encoding: 'LINEAR16', // または 'MP3', 'WEBM_OPUS' など
        sampleRateHertz: 16000,
        languageCode: 'ja-JP',
        enableAutomaticPunctuation: true, // 句読点の自動挿入
        model: 'default', // または 'medical_conversation' for 医療特化
        useEnhanced: true, // 拡張モデル使用
      },
      audio: {
        content: audioBytes,
      },
    });

    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join('\n') || '';

    // Supabaseに保存
    const { data, error } = await supabase
      .from('transcriptions')
      .insert({
        user_id: userId,
        transcribed_text: transcription,
        audio_file_name: audioFile.name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({
      success: true,
      transcription,
      data,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}