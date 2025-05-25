# OGP対応実装ドキュメント

## 実装概要
総会資料メーカーにOGP（Open Graph Protocol）対応を実装しました。これにより、SNSでのシェア時に適切な情報が表示されるようになります。

## 実装内容

### 1. 静的OGPメタタグ（index.html）
基本的なOGP情報を`index.html`に設定：

```html
<!-- OGP/SNS対策 -->
<meta property="og:title" content="PDF結合ツール【無料・安全】総会資料メーカー" />
<meta property="og:description" content="PDF結合が無料・安全にできるWebツール。完全ブラウザ完結でプライバシー保護。PTA総会資料作成に最適。ページ番号追加、議案番号追加機能付き。" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://wadatch.github.io/sokai-siryo-maker/" />
<meta property="og:site_name" content="総会資料メーカー" />
<meta property="og:image" content="https://wadatch.github.io/sokai-siryo-maker/ogp-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="総会資料メーカー - PDF結合ツール【無料・安全】" />
<meta property="og:locale" content="ja_JP" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="PDF結合ツール【無料・安全】総会資料メーカー" />
<meta name="twitter:description" content="PDF結合が無料・安全にできるWebツール。完全ブラウザ完結でプライバシー保護。PTA総会資料作成に最適。" />
<meta name="twitter:image" content="https://wadatch.github.io/sokai-siryo-maker/ogp-image.png" />
<meta name="twitter:image:alt" content="総会資料メーカー - PDF結合ツール【無料・安全】" />
<meta name="twitter:site" content="@wadatch" />
<meta name="twitter:creator" content="@wadatch" />
```

### 2. 動的OGP対応（React）
`react-helmet-async`を使用した動的なメタタグ管理：

- **SEOHeadコンポーネント**: `src/components/SEOHead.tsx`
- **HelmetProvider**: `src/main.tsx`に追加
- **構造化データ**: JSON-LDスキーマを含む

### 3. 構造化データ
検索エンジン向けの構造化データを実装：

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "総会資料メーカー",
  "description": "...",
  "url": "https://wadatch.github.io/sokai-siryo-maker/",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  }
}
```

## 設定されたOGP情報

### 基本情報
- **タイトル**: PDF結合ツール【無料・安全】総会資料メーカー
- **説明**: PDF結合が無料・安全にできるWebツール。完全ブラウザ完結でプライバシー保護。PTA総会資料作成に最適。ページ番号追加、議案番号追加機能付き。
- **URL**: https://wadatch.github.io/sokai-siryo-maker/
- **サイト名**: 総会資料メーカー
- **言語**: ja_JP

### 画像情報
- **画像URL**: https://wadatch.github.io/sokai-siryo-maker/ogp-image.png
- **サイズ**: 1200x630px
- **代替テキスト**: 総会資料メーカー - PDF結合ツール【無料・安全】

### Twitter Card
- **カードタイプ**: summary_large_image
- **アカウント**: @wadatch

## 確認方法

### 1. 開発者ツールでの確認
ブラウザの開発者ツールでHTMLソースを確認し、メタタグが正しく設定されていることを確認。

### 2. SNSシェアテスト
以下のツールでOGP情報が正しく取得されることを確認：

#### Facebook
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- URLを入力して「デバッグ」をクリック
- OGP情報とプレビューを確認

#### Twitter
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- URLを入力してプレビューを確認

#### LinkedIn
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- URLを入力して投稿プレビューを確認

### 3. 構造化データテスト
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- URLを入力して構造化データを確認

## 今後の改善点

### 1. OGP画像の作成
現在は説明ファイルが配置されているため、実際のOGP画像（1200x630px）を作成する必要があります。
詳細は `docs/ogp-image-guide.md` を参照。

### 2. 動的OGP対応の拡張
将来的に以下の機能を追加可能：
- ファイル数に応じた動的な説明文
- 処理状況に応じたタイトル変更
- 多言語対応

### 3. パフォーマンス最適化
- OGP画像の最適化
- メタタグの遅延読み込み

## トラブルシューティング

### OGP情報が更新されない場合
1. ブラウザキャッシュをクリア
2. SNSのキャッシュをクリア（Facebook Debuggerなど）
3. 画像URLが正しくアクセス可能か確認

### 画像が表示されない場合
1. 画像ファイルの存在確認
2. 画像サイズの確認（1200x630px推奨）
3. HTTPSでのアクセス確認

## 参考資料
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org WebApplication](https://schema.org/WebApplication) 