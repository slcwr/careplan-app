// データベースにサンプルデータを登録するスクリプト

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// .envファイルを読み込み
dotenv.config()

// Supabase接続情報（環境変数から取得）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ エラー: 環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env に設定してください')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// テストユーザーID（実際の環境ではauth.users から取得）
// Service Role Keyを使用しているため、RLSをバイパスできます
// 実際の本番環境では、認証済みユーザーのUUIDを使用してください
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000' // ダミーUUID

// サンプル利用者データ（IDは自動生成されるので指定しない）
const sampleClients = [
  {
    name: '山田 太郎',
    name_kana: 'ヤマダ タロウ',
    birth_date: '1948-05-15',
    gender: '男性',
    address: '東京都新宿区西新宿1-1-1',
    phone: '03-1234-5678',
    care_level: '要介護2',
    insurance_number: '1234567890',
    certification_date: '2024-01-10',
    certification_valid_from: '2024-01-10',
    certification_valid_to: '2025-01-09',
    status: 'active',
    notes: '独居。娘が週2回訪問。',
  },
  {
    name: '佐藤 花子',
    name_kana: 'サトウ ハナコ',
    birth_date: '1945-08-20',
    gender: '女性',
    address: '東京都渋谷区神南1-2-3',
    phone: '03-9876-5432',
    care_level: '要介護3',
    insurance_number: '0987654321',
    certification_date: '2024-02-15',
    certification_valid_from: '2024-02-15',
    certification_valid_to: '2025-02-14',
    emergency_contact: [
      {
        name: '佐藤 健一',
        relation: '長男',
        phone: '090-1234-5678',
      }
    ],
    status: 'active',
    notes: '認知症あり。夫と二人暮らし。',
  },
  {
    name: '鈴木 一郎',
    name_kana: 'スズキ イチロウ',
    birth_date: '1952-03-10',
    gender: '男性',
    address: '東京都世田谷区三軒茶屋2-3-4',
    phone: '03-5555-6666',
    care_level: '要介護1',
    insurance_number: '1122334455',
    certification_date: '2024-03-01',
    certification_valid_from: '2024-03-01',
    certification_valid_to: '2025-02-28',
    status: 'active',
    notes: '妻と二人暮らし。糖尿病治療中。',
  },
]

// ケアプランデータのテンプレート（client_idは実行時に設定）
const carePlanTemplates = [
  {
    life_issues: '一人暮らしで買い物や掃除が困難。足腰が弱く転倒のリスクがある。',
    needs: [
      { content: '安全に自宅で生活を続けること', period: '6ヶ月' },
      { content: '日常生活動作の維持・向上', period: '3ヶ月' },
    ],
    long_term_goal: '自宅で安全に生活を続け、健康を維持する',
    short_term_goals: ['週3回の訪問介護を受け入れる', '週2回のリハビリに参加する'],
    services: [
      { type: '訪問介護', frequency: '週3回', details: '買い物代行、掃除、調理' },
      { type: '通所リハビリ', frequency: '週2回', details: '機能訓練、入浴' },
    ],
    remarks: '緊急連絡先: 娘（田中 美咲） 090-9999-8888',
  },
  {
    life_issues: '認知症により、服薬管理や金銭管理が困難。夫の介護負担が大きい。',
    needs: [
      { content: '認知症の進行を緩やかにする', period: '6ヶ月' },
      { content: '家族の介護負担を軽減する', period: '3ヶ月' },
    ],
    long_term_goal: '在宅生活を継続し、家族の負担を軽減する',
    short_term_goals: ['定期的な通所介護サービスを利用する', 'ショートステイで家族の休息を確保する'],
    services: [
      { type: '訪問介護', frequency: '週5回', details: '身体介護、生活援助' },
      { type: '通所介護', frequency: '週3回', details: 'レクリエーション、入浴' },
      { type: 'ショートステイ', frequency: '月1回（3泊4日）', details: '家族のレスパイト' },
    ],
    remarks: '服薬管理が必要。主介護者（夫）の体調にも配慮。',
  },
  {
    life_issues: '糖尿病の管理が必要。足の痛みがあり歩行が不安定。',
    needs: [
      { content: '糖尿病の悪化を防ぐ', period: '6ヶ月' },
      { content: '安全に歩行できるようにする', period: '3ヶ月' },
    ],
    long_term_goal: '健康を維持し、自立した生活を送る',
    short_term_goals: ['血糖値を安定させる', '歩行訓練で足腰を強化する'],
    services: [
      { type: '訪問看護', frequency: '週1回', details: '血糖値測定、服薬指導' },
      { type: '通所リハビリ', frequency: '週2回', details: '歩行訓練、運動療法' },
    ],
    remarks: '定期的な血糖値管理が重要。',
  },
]

// スケジュールデータのテンプレート（client_idは実行時に設定）
const scheduleTemplates = [
  {
    title: '訪問',
    description: '初回アセスメント',
    event_type: 'assessment',
    start_time: new Date('2024-11-01T10:00:00').toISOString(),
    end_time: new Date('2024-11-01T11:00:00').toISOString(),
    all_day: false,
    location: '利用者宅',
    status: 'completed',
    priority: 'normal',
  },
  {
    title: 'モニタリング',
    description: '定期モニタリング訪問',
    event_type: 'monitoring',
    start_time: new Date('2024-11-05T14:00:00').toISOString(),
    end_time: new Date('2024-11-05T15:00:00').toISOString(),
    all_day: false,
    location: '利用者宅',
    status: 'scheduled',
    priority: 'high',
  },
  {
    title: 'サービス担当者会議',
    description: 'ケアプラン検討',
    event_type: 'meeting',
    start_time: new Date('2024-11-10T13:00:00').toISOString(),
    end_time: new Date('2024-11-10T14:30:00').toISOString(),
    all_day: false,
    location: '事業所',
    status: 'scheduled',
    priority: 'normal',
    attendees: [
      { name: '訪問介護事業所', role: 'ヘルパー', email: '' },
      { name: 'リハビリ施設', role: '理学療法士', email: '' },
    ],
  },
]

async function seedDatabase() {
  console.log('🌱 データベースにサンプルデータを登録します...\n')

  try {
    // 0. テストユーザーを作成または取得
    console.log('🔍 テストユーザーを作成中...')

    let userId = TEST_USER_ID

    // テストユーザーを作成（既に存在する場合はエラーを無視）
    const testEmail = 'test@example.com'
    const testPassword = 'test-password-123'

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })

    if (createError) {
      // ユーザーが既に存在する場合、既存ユーザーを取得
      console.log('ℹ️  テストユーザーは既に存在します。既存ユーザーを使用します。')

      // 既存ユーザーのリストを取得
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

      if (!listError && users && users.length > 0) {
        userId = users[0].id
        console.log(`✅ 既存ユーザーを使用: ${userId} (${users[0].email})`)
      } else {
        console.error('❌ ユーザーの取得に失敗しました')
        console.log('⚠️  ダミーUUIDを使用します（エラーが発生する可能性があります）')
      }
    } else if (newUser.user) {
      userId = newUser.user.id
      console.log(`✅ 新規テストユーザーを作成: ${userId} (${testEmail})`)
    }

    const insertedClientIds: string[] = []

    // 1. 利用者データを登録
    console.log('\n👥 利用者データを登録中...')

    for (const client of sampleClients) {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...client,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) {
        console.error(`❌ エラー: ${client.name}の登録に失敗しました`)
        console.error('   詳細:', error.message)
      } else if (data) {
        insertedClientIds.push(data.id)
        console.log(`✅ 登録完了: ${client.name} (${client.care_level})`)
      }
    }

    // 2. ケアプランデータを登録
    console.log('\n📋 ケアプランデータを登録中...')

    for (let i = 0; i < carePlanTemplates.length && i < insertedClientIds.length; i++) {
      const template = carePlanTemplates[i]
      const clientId = insertedClientIds[i]

      const { data, error } = await supabase
        .from('care_plan_reports')
        .insert({
          user_id: userId,
          client_id: clientId,
          transcription_id: null,
          life_issues: template.life_issues,
          needs: template.needs,
          long_term_goal: template.long_term_goal,
          short_term_goals: template.short_term_goals,
          services: template.services,
          remarks: template.remarks,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ エラー: ケアプランの登録に失敗しました (利用者ID: ${clientId})`)
        console.error('   詳細:', error.message)
      } else {
        console.log(`✅ 登録完了: ${sampleClients[i].name}様のケアプラン`)
      }
    }

    // 3. スケジュールデータを登録
    console.log('\n📅 スケジュールデータを登録中...')

    for (let i = 0; i < scheduleTemplates.length && i < insertedClientIds.length; i++) {
      const template = scheduleTemplates[i]
      const clientId = insertedClientIds[i]
      const clientName = sampleClients[i].name

      const { data, error } = await supabase
        .from('schedules')
        .insert({
          user_id: userId,
          client_id: clientId,
          title: `${clientName}様 ${template.title}`,
          description: template.description,
          event_type: template.event_type,
          start_time: template.start_time,
          end_time: template.end_time,
          all_day: template.all_day,
          location: template.location,
          status: template.status,
          priority: template.priority,
          attendees: template.attendees || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ エラー: スケジュールの登録に失敗しました (${clientName}様)`)
        console.error('   詳細:', error.message)
      } else {
        console.log(`✅ 登録完了: ${clientName}様 ${template.title}`)
      }
    }

    console.log('\n🎉 サンプルデータの登録が完了しました！')
    console.log(`\n📊 登録されたデータ:`)
    console.log(`   【利用者】 ${insertedClientIds.length}名`)
    sampleClients.forEach(c => console.log(`     - ${c.name} (${c.care_level})`))
    console.log(`   【ケアプラン】 ${Math.min(carePlanTemplates.length, insertedClientIds.length)}件`)
    console.log(`   【スケジュール】 ${Math.min(scheduleTemplates.length, insertedClientIds.length)}件`)
    console.log(`\n💡 確認方法:`)
    console.log(`   - 利用者一覧: http://localhost:3001/clients`)
    console.log(`   - スケジュール: http://localhost:3001/schedule`)
    console.log(`   - レポート一覧: http://localhost:3001/reports`)

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
seedDatabase()
