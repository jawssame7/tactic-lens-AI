# AWS SAM デプロイガイド

AWS SAMを使用したバックエンドのデプロイ方法です。

## 前提条件

1. **AWS CLIのインストール**
   ```bash
   # macOS
   brew install awscli

   # または公式インストーラーを使用
   # https://aws.amazon.com/cli/
   ```

2. **AWS SAM CLIのインストール**
   ```bash
   # macOS
   brew install aws-sam-cli

   # または公式インストーラーを使用
   # https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```

3. **AWS認証情報の設定**
   ```bash
   aws configure
   # AWS Access Key ID: YOUR_ACCESS_KEY
   # AWS Secret Access Key: YOUR_SECRET_KEY
   # Default region name: ap-northeast-1
   # Default output format: json
   ```

4. **環境変数の設定**
   ```bash
   # env.example.jsonをコピーしてenv.local.jsonを作成
   cp env.example.json env.local.json

   # env.local.jsonを編集してAPIキーを設定
   # GEMINI_API_KEYに実際のAPIキーを入力
   ```

## 初回デプロイ

### 1. 環境変数ファイルの準備

```bash
# env.example.jsonをコピー
cp env.example.json env.local.json

# env.local.jsonを編集してGemini APIキーを設定
# GEMINI_API_KEYの値を実際のAPIキーに置き換える
```

Gemini APIキーは[Google AI Studio](https://makersuite.google.com/app/apikey)で取得できます。

### 2. ビルドとデプロイ（自動スクリプト使用）

```bash
# deploy.shスクリプトを使用（推奨）
./deploy.sh
```

このスクリプトは以下を自動実行します:

- env.local.jsonからenv.jsonを生成
- TypeScriptのビルド
- SAMビルド
- AWSへのデプロイ

### 3. 手動ビルド（オプション）

手動でビルド・デプロイする場合:

```bash
npm run build
npm run sam:build
npm run sam:deploy
```

初回デプロイ時は以下の質問に答えます:

- Stack Name: `tactic-lens-backend` (デフォルトのまま)
- AWS Region: `ap-northeast-1` (デフォルトのまま)
- Parameter GeminiApiKey: `env.local.json`に設定したAPIキーを入力
- その他: デフォルトのままEnterを押す

デプロイが完了すると、API Endpointが表示されます。

## 2回目以降のデプロイ

設定が保存されているので、簡単にデプロイできます:

```bash
# deploy.shスクリプトを使用（推奨）
./deploy.sh

# または手動で
npm run build
npm run sam:build
npm run sam:deploy:prod
```

## ローカルテスト

SAMを使ってローカルでAPIをテストできます:

```bash
# ローカルAPIサーバーを起動
npm run sam:local
```

別ターミナルでテスト:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "message": "このフォーメーションについて分析してください"
  }'
```

## ログの確認

デプロイ後のログをリアルタイムで確認:

```bash
npm run sam:logs
```

## スタックの削除

リソースを完全に削除する場合:

```bash
npm run sam:delete
```

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュをクリアして再ビルド
rm -rf .aws-sam
npm run sam:build
```

### デプロイエラー: S3バケットが存在しない

初回デプロイ時は自動的にS3バケットが作成されます。
手動で作成する場合:

```bash
aws s3 mb s3://sam-deploy-tactic-lens-backend-{RANDOM_STRING}
```

### APIキーの更新

`env.local.json`のAPIキーを更新してから再デプロイ:

```bash
# env.local.jsonを編集してAPIキーを更新
# その後、deploy.shを実行
./deploy.sh
```

## フロントエンドの設定

デプロイ後、フロントエンドの`.env`ファイルを更新:

```bash
cd ../frontend
echo "VITE_API_ENDPOINT=https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/api/analyze" > .env
```

## コスト

このテンプレートで作成されるリソース:

- **Lambda関数**: 無料枠あり（月100万リクエスト、40万GB秒）
- **API Gateway**: 無料枠あり（月100万リクエスト）
- **CloudWatch Logs**: ログ保持7日間

通常の開発・テスト用途であれば、ほぼ無料枠内で収まります。

## 参考リンク

- [AWS SAM公式ドキュメント](https://docs.aws.amazon.com/serverless-application-model/)
- [SAM CLI コマンドリファレンス](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [Lambda料金](https://aws.amazon.com/lambda/pricing/)
