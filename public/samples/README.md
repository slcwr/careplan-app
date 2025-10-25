# サンプル音声データ

このディレクトリには、ケアプラン作成のための音声認識テスト用のサンプルデータが含まれています。

## ファイル一覧

### テキストスクリプト
- `care-plan-script-1.txt` - 山田太郎様のケアプラン（要介護2）
- `care-plan-script-2.txt` - 佐藤花子様のケアプラン（要介護3）

### 音声ファイル（生成後）
- `care-plan-sample-1.webm` - スクリプト1の音声ファイル
- `care-plan-sample-2.webm` - スクリプト2の音声ファイル

## 音声ファイルの生成方法

### 方法1: Google Cloud Text-to-Speech APIを使用（推奨）

```bash
# 必要なパッケージをインストール
npm install @google-cloud/text-to-speech

# スクリプトを実行
npx tsx scripts/generate-sample-audio.ts
```

**前提条件:**
- Google Cloud プロジェクトでText-to-Speech APIが有効になっていること
- `.env`ファイルに`GOOGLE_APPLICATION_CREDENTIALS`が設定されていること

### 方法2: オンラインツールを使用

以下のオンラインサービスで日本語音声を生成できます：

1. **Google Cloud Text-to-Speech** (https://cloud.google.com/text-to-speech)
   - 設定: 言語=日本語、音声=ja-JP-Neural2-C（女性）または ja-JP-Neural2-B（男性）
   - 形式: OGG/OPUS または WEBM

2. **VOICEVOX** (https://voicevox.hiroshiba.jp/)
   - 無料のオープンソース音声合成ソフト
   - より自然な日本語音声を生成可能

3. **読み上げ.com** など、他の日本語TTS（Text-to-Speech）サービス

### 方法3: 実際に録音する

最もリアルな音声データが必要な場合：

1. スクリプトを読み上げて録音
2. 録音形式をWEBM（OPUS）に変換
3. このディレクトリに保存

```bash
# FFmpegを使ってWEBM形式に変換する例
ffmpeg -i input.wav -c:a libopus -b:a 48k care-plan-sample-1.webm
```

## 音声ファイルの使用方法

生成された音声ファイルは、以下の方法でテストに使用できます：

### 1. ブラウザの開発者ツールで直接アップロード

録音画面で、実際のマイク入力の代わりにサンプル音声ファイルを使用できます。

### 2. APIエンドポイントに直接送信

```bash
curl -X POST http://localhost:3001/api/transcribe \
  -H "Content-Type: audio/webm" \
  --data-binary "@public/samples/care-plan-sample-1.webm"
```

### 3. テストコードで使用

```typescript
const audioFile = await fetch('/samples/care-plan-sample-1.webm')
const audioBlob = await audioFile.blob()
// このBlobを音声認識APIに送信
```

## 音声設定の詳細

生成される音声ファイルの仕様：

- **形式**: WEBM (OPUS codec)
- **サンプルレート**: 48000Hz
- **言語**: 日本語 (ja-JP)
- **話速**: 通常速度（1.0x）
- **音声**: Neural2シリーズ（より自然な音声）

## トラブルシューティング

### 音声ファイルが生成されない

1. Google Cloud認証情報が正しく設定されているか確認
2. Text-to-Speech APIが有効になっているか確認
3. APIの利用制限を確認

### 音声認識がうまくいかない

1. 音声形式がWEBM（OPUS、48kHz）であることを確認
2. ファイルサイズが大きすぎないか確認（10MB以下推奨）
3. APIエンドポイントの設定を確認（encoding, sampleRateHertz）

## 参考リンク

- [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech/docs)
- [Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text/docs)
- [VOICEVOX](https://voicevox.hiroshiba.jp/)
