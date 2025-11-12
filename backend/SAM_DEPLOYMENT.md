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

## 初回デプロイ

### 1. Gemini APIキーの準備

[Google AI Studio](https://makersuite.google.com/app/apikey)でAPIキーを取得してください。

### 2. ビルド

```bash
cd backend
npm run sam:build
```

このコマンドは以下を実行します:
- TypeScriptのコンパイル
- 依存関係のインストール
- Lambda関数のパッケージング

### 3. 初回デプロイ（ガイド付き）

```bash
npm run sam:deploy
```

以下の質問に答えます:

```
Stack Name [tactic-lens-backend]: Enter（デフォルトのまま）
AWS Region [ap-northeast-1]: Enter（デフォルトのまま）
Parameter GeminiApiKey []: YOUR_GEMINI_API_KEY（取得したAPIキーを入力）
Confirm changes before deploy [Y/n]: Y
Allow SAM CLI IAM role creation [Y/n]: Y
Disable rollback [y/N]: N
Save arguments to configuration file [Y/n]: Y
SAM configuration file [samconfig.toml]: Enter
SAM configuration environment [default]: Enter
```

デプロイが完了すると、API Endpointが表示されます:

```
Outputs
-------------------------------------------------------
Key                 ApiEndpoint
Description         API Gateway endpoint URL
Value               https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/api/analyze
```

## 2回目以降のデプロイ

設定が保存されているので、簡単にデプロイできます:

```bash
# ビルド
npm run sam:build

# デプロイ
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

```bash
sam deploy --parameter-overrides GeminiApiKey=NEW_API_KEY
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
