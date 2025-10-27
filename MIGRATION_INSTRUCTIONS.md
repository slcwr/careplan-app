# 📋 スケジュール管理機能 - セットアップガイド

このドキュメントでは、スケジュール管理機能を有効にするための手順を説明します。

## 📌 前提条件

- Supabaseプロジェクトが作成済み
- `.env` ファイルにSupabase接続情報が設定済み
- 開発サーバーが起動中 (`npm run dev`)

---

## 1️⃣ Supabaseでテーブルを作成

### ステップ1: Supabaseダッシュボードにアクセス

1. ブラウザで https://supabase.com/dashboard にアクセス
2. プロジェクト `mprdotnwdupzvjqfrfuo` を選択
3. 左メニューから **「SQL Editor」** をクリック

### ステップ2: SQLエディタで新しいクエリを作成

1. **「New query」** ボタンをクリック
2. クエリ名を入力（例: "Create Schedule Tables"）

### ステップ3: マイグレーションSQLをコピー&ペースト

以下の2つのファイルの内容を **順番に** SQLエディタで実行します:

**1つ目: スケジュール管理テーブルの作成**
```
supabase/migrations/20240126000000_create_schedule_tables.sql
```

**2つ目: care_plan_reportsテーブルの更新**
```
supabase/migrations/20240127000000_update_care_plan_reports.sql
```

または、以下のコマンドでクリップボードにコピーできます:

```bash
cat supabase/migrations/20240126000000_create_schedule_tables.sql | pbcopy  # Mac
cat supabase/migrations/20240126000000_create_schedule_tables.sql | xclip -selection clipboard  # Linux
```

### ステップ4: SQLを実行

1. SQLエディタの右下にある **「Run」** ボタン（または `Cmd/Ctrl + Enter`）をクリック
2. 実行が完了するまで待つ（約10-20秒）
3. 成功メッセージを確認

### ステップ5: テーブルが作成されたか確認

1. 左メニューから **「Table Editor」** をクリック
2. 以下のテーブルが表示されることを確認:
   - ✅ **clients** - 利用者情報
   - ✅ **schedules** - スケジュール
   - ✅ **alerts** - アラート
   - ✅ **monitoring_records** - モニタリング記録

### ステップ6: Row Level Security (RLS) の確認

1. 左メニューから **「Authentication」** > **「Policies」** をクリック
2. 各テーブルに以下の4つのポリシーがあることを確認:
   - `Users can view their own [table name]`
   - `Users can insert their own [table name]`
   - `Users can update their own [table name]`
   - `Users can delete their own [table name]`

---

## 2️⃣ 動作確認

### アプリケーションにアクセス

開発サーバーが起動している状態で以下のURLにアクセス:

1. **利用者管理画面**
   - http://localhost:3001/clients
   - 利用者一覧が表示される（最初は空）

2. **スケジュール管理画面**
   - http://localhost:3001/schedule
   - カレンダーが表示される

3. **既存機能**
   - http://localhost:3001/record - 音声録音
   - http://localhost:3001/reports - レポート一覧

---

## 3️⃣ テストデータの登録

### 利用者を登録

1. http://localhost:3001/clients にアクセス
2. 「新規登録」ボタンをクリック
3. フォームに入力:
   - **氏名**: 田中太郎
   - **フリガナ**: タナカタロウ
   - **生年月日**: 1950-01-01
   - **要介護度**: 要介護2
   - **認定有効期限（終了）**: 2024-12-31
4. 「登録」ボタンをクリック

### スケジュールを登録

1. http://localhost:3001/schedule にアクセス
2. 「予定を追加」ボタンをクリック
3. フォームに入力:
   - **タイトル**: 田中太郎様 訪問
   - **利用者**: 田中太郎（先ほど登録した利用者を選択）
   - **種類**: 訪問
   - **開始日時**: 任意の日時
   - **終了日時**: 開始から1時間後
4. 「登録」ボタンをクリック
5. カレンダーに予定が表示されることを確認

---

## トラブルシューティング

### ❌ エラー: "relation already exists"

テーブルがすでに存在します。以下のどちらかを選択:

**オプション1: 既存テーブルを削除してから再実行**
```sql
DROP TABLE IF EXISTS monitoring_records CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- その後、マイグレーションSQLを再実行
```

**オプション2: そのまま続行**
- テーブルが既に存在する場合は問題ありません

### ❌ エラー: "permission denied"

Service Role Keyを使用していることを確認してください。

### ❌ エラー: "foreign key constraint"

`care_plan_reports` テーブルが存在しない場合、`schedules` テーブルの作成時にエラーが出る可能性があります。

**解決方法:**
1. まず `care_plan_reports` テーブルを確認:
```sql
SELECT * FROM care_plan_reports LIMIT 0;
```

2. 存在しない場合は、`schedules` テーブルの外部キー制約を一時的に削除:
```sql
-- schedulesテーブル作成時の以下の行をコメントアウト
-- related_care_plan_id UUID REFERENCES care_plan_reports(id) ON DELETE SET NULL,

-- または、この行に変更:
related_care_plan_id UUID,
```

---

## 4️⃣ 今後の機能拡張

現在実装されている機能:
- ✅ 利用者管理（CRUD）
- ✅ スケジュール管理（カレンダー表示、予定登録）
- ✅ 音声録音・文字起こし
- ✅ ケアプラン自動抽出（Gemini AI）

今後実装予定の機能:
- 📅 **アラート自動生成** - モニタリング期限・ケアプラン更新・認定更新
- 📧 **通知機能** - メール・アプリ内通知
- 📝 **モニタリング記録** - 実施内容の記録と次回予定の自動設定
- 🔄 **繰り返し予定** - 定期訪問の自動生成
- 📊 **給付管理** - 介護保険の利用限度額管理
- 📄 **PDF出力** - ケアプラン書類の印刷

詳細は [docs/schedule-management-spec.md](docs/schedule-management-spec.md) を参照してください。

---

## 📚 関連ドキュメント

- [schedule-management-spec.md](docs/schedule-management-spec.md) - 詳細な機能仕様
- [types.ts](app/lib/types.ts) - TypeScript型定義
- [マイグレーションSQL](supabase/migrations/20240126000000_create_schedule_tables.sql) - データベーススキーマ
