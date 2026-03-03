# Antdv Next Admin

[![CI/CD](https://github.com/yelog/antdv-next-admin/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yelog/antdv-next-admin/actions/workflows/ci-cd.yml)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README.md) | [简体中文](README.zh-CN.md) | **日本語** | [한국어](README.ko-KR.md)

Vue 3 + TypeScript + Ant Design Vue で構築された、モダンで機能豊富な管理画面スキャフォールドです。

## プレビュー

**ライブデモ:** [https://antdv-next-admin.yelog.org/dashboard](https://antdv-next-admin.yelog.org/dashboard)

![スクリーンショット](docs/images/screenshot.png)

> デフォルト認証情報: admin / 123456 または user / 123456

## 特徴

### コア機能
- モダンな技術スタック: Vue 3 + Vite + TypeScript + Pinia
- UI コンポーネント: Ant Design Vue (antdv-next)
- レイアウトシステム: 垂直/水平モード対応のレスポンシブレイアウト
- マルチタブ: KeepAlive ベースのタブシステム（ピン留め、更新、コンテキストメニュー対応）
- テーマシステム: ライト/ダーク/自動の3モード対応
- 国際化 (i18n): 完全な日本語/英語切り替え、実行時サポート
- 権限システム: 動的ルート、ボタンレベル権限、ディレクティブ権限を含む RBAC
- モックデータ: 開発環境向け完全モックデータサポート

### 詳細機能
- 環境設定:
  - 6種類のプリセットテーマカラー（暁青、オーロラグリーン、パープル、夕暮れレッド、夕焼けオレンジ、シアン）
  - サイドバーテーマ切り替え（ダーク/ライト）
  - レイアウトモード切り替え（垂直/水平）
  - 5種類のページ遷移アニメーション
  - グレーモード / 色覚サポートモード

- 洗練されたデザイン:
  - スムーズなアニメーション
  - 繊細なインタラクションフィードバック
  - レスポンシブデザイン
  - 一貫したデザイン言語

### Pro コンポーネント
- ProTable: 高機能テーブルコンポーネント
  - 検索フォームの自動生成
  - 列設定（表示/非表示、並べ替え、固定）
  - ページネーション、更新、密度切り替え内蔵
  - 複数の値タイプ表示（日付、タグ、プログレスなど）

- ProForm: 高機能フォームコンポーネント
  - 設定ベースのフォーム生成
  - 自動レイアウトとバリデーション
  - 複数フォームタイプ対応
  - 送信/リセットロジック内蔵

- ProModal: 高機能モーダルコンポーネント
  - ドラッグ、フルスクリーン対応
  - フォーム自動統合
  - 統一された確認/キャンセルロジック

### ビジネスコンポーネント
- リッチテキストエディタ: TipTap ベース、画像、リンク、フォーマット対応
- CAPTCHA コンポーネント: スライダー、パズル、ポイントクリック、回転
- アイコンピッカー: Iconify ライブラリ検索・選択
- ウォーターマーク: テキスト/画像ウォーターマーク、透明度・角度設定可能

## クイックスタート

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` にアクセス

### デフォルト認証情報

```
管理者アカウント:
ユーザー名: admin
パスワード: 123456

一般ユーザーアカウント:
ユーザー名: user
パスワード: 123456
```

### ビルド

```bash
npm run build
```

### プロダクションビルドのプレビュー

```bash
npm run preview
```

## プロジェクト構成

```
antdv-next-admin/
├── public/                     # 静的アセット
├── src/
│   ├── api/                    # API インターフェース
│   ├── assets/                 # アセットファイル
│   │   └── styles/             # グローバルスタイル
│   ├── components/             # コンポーネント
│   │   ├── Layout/             # レイアウトコンポーネント
│   │   ├── Pro/                # Pro コンポーネント
│   │   ├── Permission/         # 権限コンポーネント
│   │   ├── Editor/             # リッチテキストエディタ
│   │   ├── Captcha/            # CAPTCHA コンポーネント
│   │   └── IconPicker/         # アイコンピッカー
│   ├── composables/            # コンポーザブル関数
│   ├── directives/             # カスタムディレクティブ
│   ├── locales/                # 国際化ファイル
│   ├── router/                 # ルーター設定
│   ├── stores/                 # Pinia ストア
│   ├── types/                  # TypeScript 型定義
│   ├── utils/                  # ユーティリティ関数
│   └── views/                  # ページビュー
├── mock/                       # モックデータ
├── docs/                       # ドキュメント
└── ...設定ファイル
```

## 技術スタック

### コアフレームワーク
- Vue 3.4+ - プログレッシブ JavaScript フレームワーク
- TypeScript 5+ - JavaScript のスーパーセット
- Vite 5+ - 次世代フロントエンドビルドツール

### UI & スタイリング
- Ant Design Vue - エンタープライズ UI コンポーネントライブラリ
- CSS Variables - モダンなテーマシステム
- SCSS - CSS プリプロセッサ

### 状態管理 & ルーティング
- Pinia 2+ - Vue 公式状態管理
- Vue Router 4+ - Vue 公式ルーター

### ユーティリティ
- vue-i18n - 国際化
- Axios - HTTP クライアント
- dayjs - 日付処理
- lodash-es - ユーティリティライブラリ

### 開発ツール
- vite-plugin-mock-dev-server - モックサーバー
- ESLint - コードリンティング
- Prettier - コードフォーマット

## 開発ガイド

### 要件

- Node.js >= 18
- npm >= 8 または pnpm >= 8

### 環境変数

**開発環境 (.env.development):**
```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
```

**本番環境 (.env.production):**
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### 権限の使用方法

**ディレクティブ方式:**
```vue
<a-button v-permission="'user.create'">ユーザー作成</a-button>
<a-button v-permission="['user.edit', 'user.delete']">操作</a-button>
<a-button v-permission.all="['user.edit', 'user.approve']">承認</a-button>
```

**コンポーザブル方式:**
```ts
const { can, canAll } = usePermission()

if (can('user.create')) {
  // 作成権限あり
}

if (canAll(['user.edit', 'user.approve'])) {
  // 両方の権限あり
}
```

**コンポーネント方式:**
```vue
<PermissionButton permission="user.create">
  <a-button>ユーザー作成</a-button>
</PermissionButton>
```

## モック API

開発環境で自動的に有効になる完全なモックデータシステムが含まれています。

### 利用可能なモック API

- **認証**: ログイン、ログアウト、ユーザー情報取得
- **ユーザー管理**: 一覧、作成、更新、削除
- **ロール管理**: 完全 CRUD
- **権限管理**: 一覧、権限ツリー
- **部門管理**: 一覧、ツリー構造
- **辞書管理**: タイプ一覧、データ照会
- **システム設定**: 設定一覧、更新
- **ファイル管理**: アップロード、一覧
- **ログ管理**: ログ一覧
- **ダッシュボード**: 統計データ、チャートデータ

## ハイライト

### マルチテーマサポート
6種類のプリセットカラー × 3モード (ライト/ダーク/自動) = 18種類のテーマ組み合わせ

### 柔軟なレイアウト
- 垂直レイアウト（サイドバー左）
- 水平レイアウト（メニュー上部）
- レスポンシブモバイル対応

### マルチタブシステム
- タブキャッシュ (KeepAlive)
- ピン留めタブ (affix/pinned)
- コンテキストメニュー（更新、ピン留め、閉じる、他を閉じる、左/右を閉じる、すべて閉じる）
- 永続ストレージ

### グローバル検索
キーボードショートカット `Ctrl/Cmd + K` でグローバルメニュー検索を開きます。

### 国際化
完全な中国語/英語翻訳、実行時切り替え対応。

## コントリビュート

Issue や Pull Request を歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## ライセンス

MIT License

## 謝辞

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design Vue](https://antdv.com/)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- [Ant Design Pro Vue](https://pro.antdv.com/)

---

Made with ❤️ by Claude Code