# サッカー戦術分析チャットボット

Gemini API を活用したサッカー戦術分析 Web アプリケーション。画像をアップロードして戦術的なアドバイスを受けられるチャットボット（フェーズ1: MVP）。

## 機能

- 画像アップロード（JPG, PNG, WebP、最大4MB）
- チャット形式でのAI戦術分析
- 会話履歴の保持
- レスポンシブデザイン

## 技術スタック

### フロントエンド

- React 18+ with TypeScript
- Vite
- Tailwind CSS
- 画像処理: Base64エンコード

### バックエンド

- AWS Lambda (Node.js 20.x)
- Gemini API (1.5 Flash)
- TypeScript

## セットアップ

### 前提条件

- Node.js 20.x 以上
- npm または yarn
- Gemini API キー（[Google AI Studio](https://makersuite.google.com/app/apikey)で取得）

### フロントエンド

```bash
cd frontend
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPI_ENDPOINTを設定

# 開発サーバーの起動
npm run dev
```

### バックエンド

```bash
cd backend
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してGEMINI_API_KEYを設定

# ローカル開発（オプション）
npm run dev

# ビルド
npm run build
```

## デプロイ

### バックエンド（AWS Lambda）

**推奨: AWS SAM使用**

AWS SAMを使用すると、ワンコマンドでデプロイできます:

```bash
cd backend

# ビルド
npm run sam:build

# 初回デプロイ（ガイド付き）
npm run sam:deploy

# 2回目以降
npm run sam:deploy:prod
```

詳細は [backend/SAM_DEPLOYMENT.md](backend/SAM_DEPLOYMENT.md) を参照してください。

**手動デプロイの場合:**

1. バックエンドをビルド:
```bash
cd backend
npm run build
```

2. Lambda関数を作成:
   - AWS Consoleで新しいLambda関数を作成
   - ランタイム: Node.js 20.x
   - ハンドラー: index.handler

3. コードをアップロード:
   - `dist`ディレクトリの内容と`node_modules`をZIPにしてアップロード

4. 環境変数を設定:
   - `GEMINI_API_KEY`: Gemini APIキー
   - `GEMINI_API_TIMEOUT_MS` (任意): Gemini API呼び出しのタイムアウト(ミリ秒)。未設定時は45,000ms。

5. API Gatewayを設定:
   - REST APIを作成
   - POSTメソッドを追加
   - CORSを有効化

### フロントエンド（S3 + CloudFront）

1. フロントエンドをビルド:

```bash
cd frontend
npm run build
```

2. S3バケットを作成:
   - 静的ウェブサイトホスティングを有効化

3. ビルドファイルをアップロード:

```bash
aws s3 sync dist/ s3://your-bucket-name/
```

4. CloudFrontディストリビューションを作成（オプション）

## 開発

### フロントエンドの開発

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:5173` を開く

### バックエンドの開発

ローカルでテストする場合:

```bash
cd backend
npm run dev
```

### コードフォーマットとLint

このプロジェクトでは [Biome](https://biomejs.dev/) を使用しています:

```bash
# フロントエンド
cd frontend
npm run check  # Lint + フォーマット + 自動修正

# バックエンド
cd backend
npm run check  # Lint + フォーマット + 自動修正
```

## API仕様

### POST /api/analyze

**リクエスト:**

```typescript
{
  message: string;
  image?: string; // Base64エンコードされた画像
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**レスポンス:**

```typescript
{
  reply: string;
  timestamp: string;
  processingTime?: number;
}
```

## 今後の開発予定

- フェーズ2: 動画分析対応（15秒動画）
- フェーズ3: 会話履歴の永続化、ユーザー認証

## ライセンス

MIT

## 注意事項

- Gemini API の無料枠には制限があります（1日1500リクエスト）
- 画像のファイルサイズは4MB以下に制限されています
- 本番環境では適切なセキュリティ設定を行ってください
