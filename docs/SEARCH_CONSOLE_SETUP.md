# Google Search Console 設定手順

## 概要
このプロジェクトでは、GitHub Secretsを使用してGoogle Search Consoleの所有権証明を安全に行います。
メタタグはデプロイ時に動的埋め込みされるため、リポジトリに機密情報を含める必要がありません。

## 設定手順

### 1. Google Search Console での準備
1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. プロパティを追加（URLプレフィックス形式）
3. 「HTMLタグ」による確認方法を選択
4. 指定されたメタタグのcontent値をメモ
   - 例：`<meta name="google-site-verification" content="abcdef1234567890..." />`
   - この場合、`abcdef1234567890...` の部分をコピー

### 2. GitHub Secrets の設定
リポジトリの Settings > Secrets and variables > Actions で以下を追加：

#### 必要なSecrets
- `GOOGLE_SEARCH_CONSOLE_CODE`: 
  - Google Search Consoleで指定されたメタタグのcontent値
  - 例：`abcdef1234567890abcdef1234567890abcdef12`

#### 設定例
```
GOOGLE_SEARCH_CONSOLE_CODE=abcdef1234567890abcdef1234567890abcdef12
```

### 3. デプロイの実行
1. mainブランチにpushすると自動的にデプロイが実行される
2. メタタグが動的埋め込みされ、サイトに配置される
3. Google Search Consoleで「確認」ボタンをクリック

## セキュリティ上の利点
- 検証コードがリポジトリに含まれない
- GitHub Secretsで安全に管理される
- パブリックリポジトリでも機密情報が漏洩しない

## トラブルシューティング

### メタタグが埋め込まれない場合
1. GitHub Secretsが正しく設定されているか確認
2. ワークフローのログでエラーがないか確認
3. コード内容に特殊文字が含まれていないか確認

### 検証に失敗する場合
1. コード内容が正確か確認（前後の空白に注意）
2. デプロイが完了してからしばらく待つ
3. ブラウザのソース表示でメタタグが正しく埋め込まれているか確認 