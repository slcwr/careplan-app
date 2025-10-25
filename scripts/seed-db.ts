// データベースにモックデータを登録するスクリプト

import { createClient } from '@supabase/supabase-js'
import { mockCarePlanReports } from '../app/lib/mockData'

// Supabase接続情報（環境変数から取得）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ エラー: 環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env に設定してください')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 データベースにサンプルデータを登録します...\n')

  try {
    // 既存のデータを削除（オプション）
    console.log('📝 既存のサンプルデータを削除中...')
    const { error: deleteError } = await supabase
      .from('care_plan_reports')
      .delete()
      .in('id', mockCarePlanReports.map(r => r.id))

    if (deleteError && deleteError.code !== 'PGRST116') {
      // PGRST116 = レコードが見つからない（初回実行時）
      console.warn('⚠️  削除時の警告:', deleteError.message)
    } else {
      console.log('✅ 既存データを削除しました\n')
    }

    // モックデータを登録
    console.log(`📥 ${mockCarePlanReports.length}件のレポートを登録中...`)

    for (const report of mockCarePlanReports) {
      const { data, error } = await supabase
        .from('care_plan_reports')
        .insert({
          id: report.id,
          transcription_id: report.transcription_id,
          user_id: report.user_id,
          client_name: report.client_name,
          client_age: report.client_age,
          care_level: report.care_level,
          life_issues: report.life_issues,
          needs: report.needs,
          long_term_goal: report.long_term_goal,
          short_term_goals: report.short_term_goals,
          services: report.services,
          remarks: report.remarks,
          created_at: report.created_at,
          updated_at: report.updated_at,
        })
        .select()

      if (error) {
        console.error(`❌ エラー: ${report.client_name}の登録に失敗しました`)
        console.error('   詳細:', error.message)
      } else {
        console.log(`✅ 登録完了: ${report.client_name} (ID: ${report.id})`)
      }
    }

    console.log('\n🎉 サンプルデータの登録が完了しました！')
    console.log(`\n📊 登録されたデータ:`)
    console.log(`   - 山田 太郎 (要介護2)`)
    console.log(`   - 佐藤 花子 (要介護3)`)
    console.log(`   - 鈴木 一郎 (要介護1)`)
    console.log(`\n💡 http://localhost:3001/reports で確認できます`)

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
seedDatabase()
