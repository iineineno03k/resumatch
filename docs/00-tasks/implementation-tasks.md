# 実装タスク一覧

## 概要

このドキュメントは、ResuMatch の実装フェーズで必要なタスクを整理したものです。
別コンテキスト/別担当者に引き継ぐ際に参照してください。

**前提:**
- 要件定義、DB設計、API設計、画面設計は完了済み
- 設計ドキュメントは `docs/` 配下を参照
- プロジェクトルールは `CLAUDE.md` を参照

---

## Phase 1: プロジェクト初期化

### 1.1 Next.js プロジェクト作成
- [ ] `bunx create-next-app` で Next.js 15 プロジェクト作成
- [ ] TypeScript, ESLint, App Router 有効化
- [ ] 不要なボイラープレート削除

### 1.2 開発環境セットアップ
- [ ] Bun でパッケージ管理
- [ ] Vitest 導入（テスト）
- [ ] Storybook 導入（UIカタログ）
- [ ] Prettier / ESLint 設定
- [ ] `.env.local` 雛形作成

### 1.3 ディレクトリ構成
```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/          # 認証必須ページ
│   ├── (public)/        # 認証不要ページ
│   ├── api/             # API Routes
│   └── invite/[token]/  # 招待リンク
├── components/          # UIコンポーネント
│   ├── ui/              # 汎用UI（Button, Input等）
│   └── features/        # 機能別コンポーネント
├── lib/                 # ユーティリティ
│   ├── db/              # Supabase クライアント
│   ├── ai/              # AI処理モジュール
│   └── utils/           # 汎用ユーティリティ
├── types/               # 型定義
└── hooks/               # カスタムフック
```

**参照:** `docs/02-architecture/tech-stack.md`

---

## Phase 2: 認証（Clerk）

### 2.1 Clerk セットアップ
- [ ] Clerk アカウント作成、アプリケーション作成
- [ ] `@clerk/nextjs` インストール
- [ ] 環境変数設定（CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY）
- [ ] ClerkProvider でアプリをラップ
- [ ] ミドルウェア設定（認証必須ルートの保護）

### 2.2 認証画面
- [ ] `/sign-in` - Clerk の SignIn コンポーネント配置
- [ ] `/sign-up` - Clerk の SignUp コンポーネント配置
- [ ] リダイレクト設定（ログイン後の遷移先）

### 2.3 Clerk Webhook
- [ ] Webhook エンドポイント作成（`/api/webhooks/clerk`）
- [ ] 署名検証実装
- [ ] user.created → users テーブルに INSERT
- [ ] user.updated → users テーブルを UPDATE

**参照:** `docs/04-api/endpoints.md`

---

## Phase 3: DB（Supabase）

### 3.1 Supabase セットアップ
- [ ] Supabase プロジェクト作成
- [ ] 環境変数設定（SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY）
- [ ] `@supabase/supabase-js` インストール
- [ ] Supabase クライアント作成（`lib/db/client.ts`）

### 3.2 テーブル作成
- [ ] SQL実行（`docs/03-database/tables.md` の全テーブル作成スクリプト）
- [ ] teams
- [ ] users
- [ ] team_members
- [ ] team_invitations
- [ ] jobs
- [ ] applicants
- [ ] resumes
- [ ] notes

### 3.3 Storage セットアップ
- [ ] `resumes` バケット作成（履歴書PDF用）
- [ ] アクセスポリシー設定（認証済みユーザーのみ）

### 3.4 型生成
- [ ] Supabase CLI で型生成
- [ ] `types/database.ts` に配置

**参照:** `docs/03-database/tables.md`, `docs/03-database/er-diagram.md`

---

## Phase 4: 基本API実装

### 4.1 共通処理
- [ ] 認証ミドルウェア（Clerk セッション検証）
- [ ] チーム所属チェック関数
- [ ] エラーハンドリング共通化
- [ ] レスポンス形式の統一

### 4.2 チーム API
- [ ] `GET /api/teams` - 所属チーム一覧
- [ ] `POST /api/teams` - チーム作成

### 4.3 招待 API
- [ ] `POST /api/teams/:teamId/invitations` - 招待リンク発行
- [ ] `GET /api/invitations/:token` - 招待検証（認証不要）
- [ ] `POST /api/invitations/:token/accept` - 招待受け入れ

### 4.4 求人 API
- [ ] `GET /api/teams/:teamId/jobs` - 求人一覧
- [ ] `POST /api/teams/:teamId/jobs` - 求人作成
- [ ] `GET /api/teams/:teamId/jobs/:jobId` - 求人詳細
- [ ] `PATCH /api/teams/:teamId/jobs/:jobId` - 求人更新

### 4.5 応募者 API
- [ ] `GET /api/teams/:teamId/applicants` - 応募者一覧（フィルタ、ページネーション）
- [ ] `POST /api/teams/:teamId/applicants` - 応募者登録
- [ ] `GET /api/teams/:teamId/applicants/:applicantId` - 応募者詳細
- [ ] `PATCH /api/teams/:teamId/applicants/:applicantId` - 応募者更新

### 4.6 メモ API
- [ ] `GET /api/teams/:teamId/applicants/:applicantId/notes` - メモ一覧
- [ ] `POST /api/teams/:teamId/applicants/:applicantId/notes` - メモ追加

**参照:** `docs/04-api/endpoints.md`

---

## Phase 5: AI/PDF処理

### 5.1 PDF テキスト抽出モジュール
- [ ] `pdfjs-dist` インストール
- [ ] テキスト抽出関数作成（`lib/ai/pdf-extract.ts`）
- [ ] **単体テスト作成**（様々なPDFパターン）

### 5.2 OCR フォールバック
- [ ] `tesseract.js` インストール
- [ ] 日本語言語データ設定
- [ ] OCR関数作成（`lib/ai/ocr.ts`）
- [ ] **単体テスト作成**

### 5.3 Gemini API 連携
- [ ] Google AI Studio でAPIキー取得
- [ ] `@google/generative-ai` インストール
- [ ] プロンプト設計（履歴書テキスト → 構造化JSON）
- [ ] 解析関数作成（`lib/ai/analyze-resume.ts`）
- [ ] **単体テスト作成**

### 5.4 履歴書 API
- [ ] `POST /api/teams/:teamId/applicants/:applicantId/resume` - アップロード
- [ ] `GET /api/teams/:teamId/applicants/:applicantId/resume` - 取得
- [ ] `POST /api/teams/:teamId/applicants/:applicantId/resume/analyze` - AI解析実行

### 5.5 統合テスト
- [ ] PDF → テキスト抽出 → AI解析 の一連フローテスト

**参照:** `docs/05-ai-module/`（未作成の場合は作成）

**重要:** AI/PDF処理は単体テストを必ず書く。モジュール単位で精度を担保してから統合する。

---

## Phase 6: フロントエンド実装

### 6.1 共通コンポーネント
- [ ] Header（ナビゲーション）
- [ ] StatusBadge（ステータス表示）
- [ ] SkillTag（スキルタグ）
- [ ] StarRating（星評価）
- [ ] FileUpload（PDFアップロード）
- [ ] **Storybook でカタログ化**

### 6.2 オンボーディング
- [ ] `/onboarding` - チーム作成画面
- [ ] チーム未所属時のリダイレクト処理

### 6.3 招待フロー
- [ ] `/invite/[token]` - 招待リンク画面
- [ ] 招待検証 → ログイン誘導 → 参加処理

### 6.4 求人管理
- [ ] `/jobs` - 求人一覧画面
- [ ] `/jobs/new` - 求人作成画面
- [ ] `/jobs/[id]/edit` - 求人編集画面

### 6.5 応募者管理
- [ ] `/applicants` - 応募者一覧画面（フィルタ、ページネーション）
- [ ] `/applicants/new` - 応募者登録画面
- [ ] `/applicants/[id]` - 応募者詳細画面（**メイン画面**）
  - [ ] AI解析結果表示
  - [ ] メモ・評価セクション

### 6.6 チーム設定（MVP後）
- [ ] `/settings` - チーム設定画面
- [ ] 招待リンク発行機能

**参照:** `docs/06-ui/screens.md`

---

## Phase 7: テスト・品質

### 7.1 ユニットテスト
- [ ] AI/PDF処理モジュール
- [ ] API ハンドラー
- [ ] ユーティリティ関数

### 7.2 コンポーネントテスト
- [ ] Storybook でビジュアルテスト
- [ ] インタラクションテスト

### 7.3 E2Eテスト（オプション）
- [ ] Playwright 導入
- [ ] 主要フロー（ログイン → 応募者登録 → AI解析）

---

## Phase 8: デプロイ

### 8.1 Vercel デプロイ
- [ ] Vercel プロジェクト作成
- [ ] GitHub リポジトリ連携
- [ ] 環境変数設定
- [ ] デプロイ確認

### 8.2 ドメイン設定
- [ ] カスタムドメイン取得（例: resumatch.jp）
- [ ] Vercel でドメイン設定
- [ ] SSL 確認

### 8.3 本番環境調整
- [ ] Supabase 本番プロジェクト作成（必要なら）
- [ ] Clerk 本番設定
- [ ] 環境変数切り替え

---

## Phase 9: LP（ランディングページ）

### 9.1 LP 設計
- [ ] ワイヤーフレーム作成
- [ ] コピーライティング

### 9.2 LP 実装
- [ ] `/` - LP ページ
- [ ] 機能紹介セクション
- [ ] スクリーンショット
- [ ] CTA（無料で始める）

### 9.3 SEO
- [ ] メタタグ設定
- [ ] OGP 設定

---

## タスク優先度

### MVP（最優先）
1. Phase 1: プロジェクト初期化
2. Phase 2: 認証（Clerk）
3. Phase 3: DB（Supabase）
4. Phase 4: 基本API実装
5. Phase 5: AI/PDF処理
6. Phase 6: フロントエンド実装（6.1〜6.5）
7. Phase 8: デプロイ

### MVP後
- Phase 6.6: チーム設定
- Phase 7: テスト強化
- Phase 9: LP

---

## 見積もり目安

| Phase | 内容 | 目安 |
|-------|------|------|
| 1 | プロジェクト初期化 | 0.5日 |
| 2 | 認証（Clerk） | 1日 |
| 3 | DB（Supabase） | 0.5日 |
| 4 | 基本API実装 | 2〜3日 |
| 5 | AI/PDF処理 | 2〜3日 |
| 6 | フロントエンド | 3〜5日 |
| 7 | テスト | 1〜2日 |
| 8 | デプロイ | 0.5日 |
| 9 | LP | 1〜2日 |

**合計目安: 12〜18日**（1人で作業する場合）

---

## 引き継ぎ時の注意

1. **必ず `CLAUDE.md` を読む** - 個人情報の取り扱いルールが書いてある
2. **設計ドキュメントを参照** - `docs/` 配下に全ての設計がある
3. **AI/PDF処理は単体テストを先に書く** - 統合前にモジュール単位で精度担保
4. **DBスキーマは変わる前提** - カラム追加・型変更はあり得る
