# 開発ガイド

## プロジェクト構成

```
tactic-lens-AI/
├── frontend/          # Reactフロントエンド
│   ├── src/
│   │   ├── api/      # API通信
│   │   ├── components/ # Reactコンポーネント
│   │   ├── types/    # TypeScript型定義
│   │   ├── utils/    # ユーティリティ関数
│   │   ├── App.tsx   # メインアプリケーション
│   │   └── index.css # Tailwind CSS
│   ├── .env.example
│   └── package.json
├── backend/           # AWS Lambda関数
│   ├── src/
│   │   └── index.ts  # Lambda関数
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── deploy.sh     # デプロイスクリプト
├── requirements.md    # 要件定義書
└── README.md
```

## ローカル開発環境のセットアップ

### 1. 環境変数の設定

#### フロントエンド

```bash
cd frontend
cp .env.example .env
```

`.env`ファイルを編集:
```
VITE_API_ENDPOINT=http://localhost:3000/api/analyze
```

#### バックエンド

```bash
cd backend
cp .env.example .env
```

`.env`ファイルを編集:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Gemini APIキーは [Google AI Studio](https://makersuite.google.com/app/apikey) で取得できます。

### 2. 依存関係のインストール

```bash
# フロントエンド
cd frontend
npm install

# バックエンド
cd backend
npm install
```

### 3. 開発サーバーの起動

```bash
# フロントエンド（ポート5173）
cd frontend
npm run dev

# バックエンド（別ターミナル、ポート3000）
cd backend
npm run dev
```

## コードフォーマットとLint

このプロジェクトでは[Biome](https://biomejs.dev/)を使用しています。

### フロントエンド

```bash
cd frontend

# Lintのみ実行
npm run lint

# Lintと自動修正
npm run lint:fix

# フォーマット
npm run format

# Lint + フォーマット + 自動修正
npm run check
```

### バックエンド

```bash
cd backend

# Lintのみ実行
npm run lint

# Lintと自動修正
npm run lint:fix

# フォーマット
npm run format

# Lint + フォーマット + 自動修正
npm run check
```

## ローカルテスト

### フロントエンドのみテスト

バックエンドが起動していない状態でも、フロントエンドのUIは確認できます。
API呼び出し時にエラーが表示されますが、これは正常です。

### フルスタックテスト

1. バックエンドを起動
2. フロントエンドを起動
3. ブラウザで `http://localhost:5173` を開く
4. 画像をアップロードしてメッセージを送信

## ビルド

### フロントエンド

```bash
cd frontend
npm run build
```

`dist/`フォルダに静的ファイルが生成されます。

### バックエンド

```bash
cd backend
npm run build
```

`dist/`フォルダにコンパイル済みのJavaScriptが生成されます。

## デプロイ

### バックエンド（AWS Lambda）

#### 方法1: AWS SAM（推奨）

AWS SAMを使うと、インフラのコード化とワンコマンドデプロイが可能です。

**前提条件:**
- AWS CLI インストール済み
- AWS SAM CLI インストール済み
- AWS認証情報設定済み

詳細は [backend/SAM_DEPLOYMENT.md](../backend/SAM_DEPLOYMENT.md) を参照。

**初回デプロイ:**

```bash
cd backend

# ビルド
npm run sam:build

# デプロイ（ガイド付き）
npm run sam:deploy
```

ガイドに従って以下を入力:
- Stack Name: `tactic-lens-backend`（デフォルト）
- Region: `ap-northeast-1`（デフォルト）
- Gemini API Key: 取得したAPIキーを入力

**2回目以降:**

```bash
npm run sam:build
npm run sam:deploy:prod
```

**ローカルテスト:**

```bash
npm run sam:local
```

**ログ確認:**

```bash
npm run sam:logs
```

#### 方法2: 手動デプロイ

1. ビルド:
```bash
cd backend
npm run build
```

2. 依存関係を含めてZIPファイルを作成:
```bash
chmod +x deploy.sh
./deploy.sh
```

3. AWS Console でLambda関数を作成:
   - 関数名: `tactic-lens-analyzer`
   - ランタイム: Node.js 20.x
   - アーキテクチャ: x86_64

4. `lambda.zip`をアップロード

5. 環境変数を設定:
   - `GEMINI_API_KEY`: Gemini APIキー

6. API Gatewayを設定:
   - REST APIを作成
   - リソース `/api/analyze` を追加
   - POSTメソッドを追加
   - Lambda統合を設定
   - CORSを有効化
   - デプロイ

### フロントエンド（S3 + CloudFront）

1. ビルド:
```bash
cd frontend
npm run build
```

2. S3バケットを作成:
```bash
aws s3 mb s3://tactic-lens-frontend
```

3. バケットポリシーを設定して静的ウェブサイトホスティングを有効化

4. ビルドファイルをアップロード:
```bash
aws s3 sync dist/ s3://tactic-lens-frontend/ --delete
```

5. CloudFrontディストリビューションを作成（オプション）

## トラブルシューティング

### フロントエンドでAPIエラーが発生する

1. バックエンドが起動しているか確認
2. `.env`ファイルの`VITE_API_ENDPOINT`が正しいか確認
3. CORSエラーの場合、バックエンドのCORS設定を確認

### バックエンドでGemini APIエラーが発生する

1. `GEMINI_API_KEY`が正しく設定されているか確認
2. APIキーが有効か確認
3. Gemini APIの無料枠制限に達していないか確認

### 画像アップロードが失敗する

1. ファイルサイズが4MB以下か確認
2. ファイル形式がJPG、PNG、WebPか確認
3. Base64エンコードが正しく動作しているか確認

## コーディング規約

### Biome設定

- フォーマッター: インデント幅2、セミコロンあり、シングルクォート
- Linter: `recommended`ルール + カスタムルール
- コミット前に`npm run check`を実行すること

### TypeScript

- `strict`モードを使用
- 明示的な型定義を優先
- `any`型の使用は最小限に（Biomeが警告）

### React

- 関数コンポーネントを使用
- フックを活用
- propsの型定義を必須に
- buttonには`type`属性を明示

### CSS

- Tailwind CSSのユーティリティクラスを使用
- カスタムCSSは最小限に

## テスト

TODO: テストフレームワークの導入予定

## CI/CD

TODO: GitHub Actionsの設定予定

## 今後の改善点

- [ ] エラーハンドリングの強化
- [ ] ローディング状態の改善
- [ ] オフライン対応
- [ ] PWA化
- [ ] ユニットテストの追加
- [ ] E2Eテストの追加
- [ ] CI/CDパイプラインの構築
- [ ] マークダウン形式のレスポンス表示
- [ ] 画像の圧縮処理
- [ ] レート制限の実装
