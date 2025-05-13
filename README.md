# 総会資料メーカー

PTA総会資料のPDFを結合し、ページ番号や議案番号を自動で付与できるWebアプリケーションです。

## 機能

- PDFファイルの結合
- ページ番号の自動付与
  - 数字のみ
  - 「- n -」形式
  - 「n ページ」形式
- 議案番号の自動付与
  - 議案
  - 添付資料
  - 参考資料
- ドラッグ＆ドロップでのファイル操作
- サムネイル表示
- 完全なブラウザ上での動作（プライバシー保護）

## 技術スタック

- React
- TypeScript
- Vite
- Tailwind CSS
- pdf-lib
- PDF.js

## 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/wadatch/sokai-siryo-maker.git
cd sokai-siryo-maker
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## デプロイ

このプロジェクトはGitHub Pagesでホストされています。
デプロイは自動的に行われ、mainブランチへのプッシュ時に実行されます。

## ライセンス

MITライセンス

## 作者

[wadatch](https://github.com/wadatch)
