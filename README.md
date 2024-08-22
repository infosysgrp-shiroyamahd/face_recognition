# 顔認証勤怠システム - フロントエンド

このリポジトリには、顔認証を利用した勤怠システムのフロントエンド部分が含まれています。本システムは、ReactとTypeScriptを使用して構築されており、主にiPadのSafariブラウザでの利用を想定しています。

## 技術スタック

- **React + TypeScript**: フロントエンドのフレームワークとして使用し、コンポーネントベースのUIを構築しています。
- **Vite**: 高速なビルドツールであり、Flaskバックエンドとの統合を容易にします。
- **Tailwind CSS**: レスポンシブデザインをサポートするユーティリティファーストのCSSフレームワークです。
- **Material UI**: SafariでのJavaScriptのブロッキング問題を解決するために使用されています。
- **InsightFace**: 顔認証の主要な技術として使用されています。

## コンポーネント概要

### 1. Home

- **概要**:  
  システムのホームページで、ユーザーがログイン後に表示されるメイン画面です。画面中央に現在の時刻が表示されます。

### 2. Sidebar

- **概要**:  
  画面左側に配置されたサイドバーコンポーネントです。ボタンをクリックすることで表示・非表示を切り替えることができます。他のコンポーネントへのナビゲーションリンクを含んでいます。

### 3. Capture

- **概要**:  
  新しいユーザーの顔を登録するためのコンポーネントです。Webカメラを使用して顔をキャプチャし、登録プロセスを開始します。

### 4. ReRegister

- **概要**:  
  すでに登録されているユーザーの顔を再登録するためのコンポーネントです。新しい顔のキャプチャや既存データの更新が可能です。

### 5. Verify

- **概要**:  
  登録された顔データを使用してユーザーを認証するコンポーネントです。勤怠記録を行う前に本人確認を実施します。

### 6. Liveness

- **概要**:  
  ライブネスチェックを行うためのコンポーネントですが、主にテスト用に設計されており、実際の運用には使用しません。

### 7. Attendance

- **概要**:  
  勤怠の記録を行うためのコンポーネントです。ユーザーが顔認証を完了した後に勤怠が記録されます。

## ローカル環境での実行方法

以下の手順に従って、ローカル環境でプロジェクトを実行することができます。

### 前提条件

- Node.js（推奨バージョン：14.x 以上）
- npm または yarn（任意のパッケージマネージャー）

### セットアップ手順

1. **リポジトリをクローンする**:

   ```bash
   git clone https://github.com/infosysgrp-shiroyamahd/face_recognition.git
   ```

2. **プロジェクトディレクトリに移動する**:

   ```bash
   cd face-recognition
   ```

3. **依存関係をインストールする**:

   ```bash
   npm install
   ```

   または

   ```bash
   yarn install
   ```

4. **開発サーバーを起動する**:

   ```bash
   npm run dev
   ```

   または

   ```bash
   yarn dev
   ```

   上記のコマンドを実行すると、Viteが開発サーバーを起動し、ローカルホストでアプリケーションが利用可能になります。通常、`http://localhost:5173` でアクセスできます。

### ビルドとデプロイ

本番環境向けにアプリケーションをビルドするには、以下のコマンドを使用します。

```bash
npm run build
```

または

```bash
yarn build
```

これにより、最適化された静的ファイルが `dist` ディレクトリに生成されます。これらのファイルをサーバーにデプロイして、プロダクション環境でアプリケーションをホストします。

## ライセンス

このプロジェクトはAGPL-3.0ライセンスの下でライセンスされています。詳細については、リポジトリ内の `LICENSE` ファイルを参照してください。
