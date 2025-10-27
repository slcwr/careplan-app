// app/api/transcribe/route.ts
import { SpeechClient } from '@google-cloud/speech';
import { createClient } from '@supabase/supabase-js';
import { extractCarePlanFromTranscription } from '@/app/lib/gemini';

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
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
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

    // Geminiを使って構造化データを抽出
    console.log('Extracting structured data with Gemini...');
    const extractedData = await extractCarePlanFromTranscription(transcription);
    console.log('Extracted data:', extractedData);

    // transcriptionsテーブルに保存
    const { data: transcriptionData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        user_id: userId,
        transcribed_text: transcription,
        audio_file_name: audioFile.name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transcriptionError) throw transcriptionError;

    // 利用者情報をclientsテーブルに保存（または既存の利用者を検索）
    let clientId = null;
    if (extractedData.client_name) {
      // 既存の利用者を検索
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('name', extractedData.client_name)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // 新規利用者として登録
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            name: extractedData.client_name,
            birth_date: extractedData.client_age
              ? new Date(new Date().getFullYear() - extractedData.client_age, 0, 1).toISOString().split('T')[0]
              : new Date('1950-01-01').toISOString().split('T')[0],
            care_level: extractedData.care_level,
            status: 'active',
          })
          .select('id')
          .single();

        if (!clientError && newClient) {
          clientId = newClient.id;
        }
      }
    }

    // care_plan_reportsテーブルに構造化データを保存
    const { data: carePlanData, error: carePlanError } = await supabase
      .from('care_plan_reports')
      .insert({
        user_id: userId,
        transcription_id: transcriptionData.id,
        client_id: clientId,
        life_issues: extractedData.life_issues,
        long_term_goal: extractedData.long_term_goal,
        long_term_goal_period: extractedData.long_term_goal_period,
        needs: extractedData.needs,
        services: extractedData.services,
        equipment: extractedData.equipment,
        remarks: extractedData.remarks,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (carePlanError) {
      console.error('Error saving care plan:', carePlanError);
      // transcriptionは保存できているので、エラーでも続行
    }

    return Response.json({
      success: true,
      transcription,
      extractedData,
      transcriptionData,
      carePlanData,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}