# 総会資料メーカー

[![Deploy to GitHub Pages](https://github.com/wadatch/sokai-siryo-maker/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/wadatch/sokai-siryo-maker/actions/workflows/pages/pages-build-deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC.svg)](https://tailwindcss.com/)

PTA総会資料の作成を支援するWebアプリケーションです。PDFファイルの結合、ページ番号の追加、議案番号の追加などの機能を提供します。

## 特徴

- PDFファイルの結合
- ページ番号の追加（カスタマイズ可能）
- 議案番号の追加
- ドラッグ＆ドロップによるファイル操作
- 完全にブラウザ上で動作（プライバシー保護）

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
