import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({
  title = "PDF結合 無料【PTA総会資料メーカー】完全ブラウザ完結・安全なPDF結合ツール",
  description = "PTA総会資料メーカーは完全無料で安全なPDF結合ツール。ブラウザ完結でサーバーアップロード不要、プライバシー完全保護。PTA総会資料作成に最適。ページ番号・議案番号の自動追加機能付き。",
  image = "https://wadatch.github.io/sokai-siryo-maker/ogp-image.png",
  url = "https://wadatch.github.io/sokai-siryo-maker/",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* 基本的なメタタグ */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* OGP */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="PTA総会資料メーカー" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="PTA総会資料メーカー - PDF結合ツール【無料・安全】" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="PTA総会資料メーカー - PDF結合ツール【無料・安全】" />
      <meta name="twitter:site" content="@wadatch" />
      <meta name="twitter:creator" content="@wadatch" />
      
      {/* 構造化データ - WebApplication */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "PTA総会資料メーカー",
          "alternateName": "PDF結合ツール 無料",
          "description": description,
          "url": url,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "JPY"
          },
          "author": {
            "@type": "Person",
            "name": "wadatch"
          },
          "publisher": {
            "@type": "Person",
            "name": "wadatch"
          },
          "featureList": [
            "無料でPDF結合",
            "ページ番号自動追加",
            "議案番号追加",
            "完全ブラウザ完結",
            "プライバシー保護",
            "サーバーアップロード不要"
          ]
        })}
      </script>

      {/* 構造化データ - FAQ */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "PDF結合は本当に無料で使えますか？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "はい、完全無料でご利用いただけます。登録不要、回数制限なし、透かしなしで、すべての機能が無料でお使いいただけます。"
              }
            },
            {
              "@type": "Question",
              "name": "アップロードしたPDFファイルは安全ですか？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "完全に安全です。このツールは完全にブラウザ上で動作し、ファイルはサーバーにアップロードされません。すべての処理がお使いのデバイス内で行われるため、プライバシーが完全に保護されます。"
              }
            },
            {
              "@type": "Question",
              "name": "PDFを結合する方法は簡単ですか？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "とても簡単です。PDFファイルを選択またはドラッグ&ドロップし、必要に応じてページ番号などの設定をして、「PDF結合」ボタンを押すだけです。専門知識は一切不要です。"
              }
            },
            {
              "@type": "Question",
              "name": "何個までPDFファイルを結合できますか？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "ファイル数に制限はありません。ただし、お使いのブラウザのメモリ容量によって処理できるファイルサイズには限界があります。一般的なPCであれば、数十個のファイルを問題なく結合できます。"
              }
            },
            {
              "@type": "Question",
              "name": "スマートフォンやタブレットでも使えますか？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "はい、スマートフォンやタブレットでもご利用いただけます。レスポンシブデザインに対応しているため、どのデバイスでも快適にPDF結合ができます。"
              }
            },
            {
              "@type": "Question",
              "name": "インストール不要で使えますか？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "はい、完全にインストール不要です。ブラウザでアクセスするだけで、すぐにPDF結合が始められます。ソフトウェアのダウンロードやインストールは一切不要です。"
              }
            }
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead; 