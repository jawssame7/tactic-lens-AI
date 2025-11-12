# デプロイメントガイド

## 必要なGitHub Secrets

GitHubリポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定してください。

### VITE_API_ENDPOINT

- **説明**: バックエンドAPIのエンドポイントURL
- **値の例**: `https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/api/analyze`
- **取得方法**:
  1. バックエンドディレクトリで `sam deploy` を実行
  2. デプロイ完了後に表示される `ApiEndpoint` の値をコピー
  3. または、AWS CloudFormationコンソールでスタック出力から取得

### AWS認証情報（既に設定済み）

- AWS IAMロール: `arn:aws:iam::703671935472:role/tatic_lens_ai_role`
- リージョン: `ap-northeast-1`

## デプロイ手順

### 1. バックエンドのデプロイ（ローカルで実行）

```bash
cd backend
sam build
sam deploy --guided
```

初回デプロイ時の設定:
- Stack Name: `tactic-lens-backend`
- AWS Region: `ap-northeast-1`
- Parameter GeminiApiKey: **あなたのGemini APIキーを入力**
- Confirm changes before deploy: `N`
- Allow SAM CLI IAM role creation: `Y`
- Disable rollback: `N`
- AnalyzeFunction has no authentication: `y` (公開APIの場合)

デプロイ完了後、出力される `ApiEndpoint` の値をメモしてください。

### 2. GitHub Secretsの設定

1. GitHubリポジトリページを開く
2. Settings > Secrets and variables > Actions
3. "New repository secret" をクリック
4. 名前: `VITE_API_ENDPOINT`
5. 値: 上記でメモした `ApiEndpoint` の値を貼り付け
6. "Add secret" をクリック

### 3. フロントエンドのデプロイ（GitHub Actionsで自動実行）

mainブランチにプッシュすると、GitHub Actionsが自動的に以下を実行します:

1. フロントエンドのビルド（環境変数 `VITE_API_ENDPOINT` を注入）
2. S3へのデプロイ
3. CloudFrontキャッシュのクリア

手動でデプロイしたい場合:
1. GitHubリポジトリページで Actions タブを開く
2. "Deploy" ワークフローを選択
3. "Run workflow" をクリック

## セキュリティのベストプラクティス

- ✅ APIエンドポイントURLはGitHub Secretsに保存（リポジトリには含めない）
- ✅ Gemini APIキーはAWS Parameter StoreまたはSecrets Managerで管理
- ✅ 環境変数ファイル（`.env.production`）にはプレースホルダーのみ記載
- ✅ ビルド時にCI/CD環境でのみ実際の値を注入

## トラブルシューティング

### ビルドエラー: "VITE_API_ENDPOINT is not defined"

GitHub Secretsが正しく設定されているか確認してください。

### APIエンドポイントに接続できない

1. バックエンドが正しくデプロイされているか確認
2. CORS設定が正しいか確認（`template.yaml`の`AllowOrigin`）
3. API GatewayのURLが正しいか確認
