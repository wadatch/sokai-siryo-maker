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
  title = "PDF結合ツール【無料・安全】総会資料メーカー",
  description = "PDF結合が無料・安全にできるWebツール。完全ブラウザ完結でプライバシー保護。PTA総会資料作成に最適。ページ番号追加、議案番号追加機能付き。",
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
      <meta property="og:site_name" content="総会資料メーカー" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="総会資料メーカー - PDF結合ツール【無料・安全】" />
      <meta property="og:locale" content="ja_JP" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="総会資料メーカー - PDF結合ツール【無料・安全】" />
      <meta name="twitter:site" content="@wadatch" />
      <meta name="twitter:creator" content="@wadatch" />
      
      {/* 構造化データ */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "総会資料メーカー",
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
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead; 