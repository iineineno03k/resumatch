# 実装タスク一覧

## 概要

このドキュメントは、ResuMatch の実装フェーズで必要なタスクを整理したものです。
別コンテキスト/別担当者に引き継ぐ際に参照してください。

**前提:**
- 要件定義、DB設計、API設計、画面設計は完了済み
- 設計ドキュメントは `docs/` 配下を参照
- プロジェクトルールは `CLAUDE.md` を参照

---

## 現在の進捗

| Phase | 内容 | 状態 |
|-------|------|------|
| 0 | 準備（Git、ドキュメント整備） | 完了 |
| 1 | プロジェクト初期化 | 完了 |
| 2 | 認証（Clerk） | 完了 |
| 3 | DB（Supabase） | 完了 |
| 4 | 基本API実装 | 完了 |
| 5 | AI/PDF処理 | **次はここから** |
| 6 | フロントエンド実装 | 未着手 |
| 7 | テスト・品質 | 未着手 |
| 8 | デプロイ | 未着手 |
| 9 | LP | 未着手 |

---

## Phase 0: 準備（完了）

- [x] Git リポジトリ初期化
- [x] GitHub リポジトリ作成・プッシュ
- [x] `.gitignore` 作成
- [x] `CLAUDE.md` 作成（プロジェクトルール）
- [x] `docs/` ドキュメント整備
- [x] フロントエンド実装標準作成（`docs/06-ui/frontend-standards.md`）
- [x] Next.js設計ガイド追加（`docs/06-ui/nextjs-basic-principle/`）
- [x] コミットメッセージルール策定

---

## Phase 1: プロジェクト初期化（完了）

### 前提条件
- [x] Bun がインストールされていること
  ```bash
  # 確認
  bun --version

  # インストールされていない場合
  curl -fsSL https://bun.sh/install | bash
  ```

### 1.1 Next.js プロジェクト作成
- [x] 現在のディレクトリで Next.js プロジェクト作成:
  ```bash
  bunx create-next-app@latest . --biome --app --src-dir --use-bun --import-alias "@/*"
  ```
  ※ `.` で現在のディレクトリに作成（サブディレクトリを作らない）
  ※ `--biome` で最初から Biome を使用（ESLint ではない）
  ※ `--use-bun` で Bun をパッケージマネージャーに指定
  ※ `--typescript` と `--tailwind` はデフォルトで有効
  ※ 既存ファイル（README.md, .gitignore 等）の上書き確認が出たら許可する
- [x] 作成後の確認:
  - [x] `.gitignore` に既存の設定（.env.local, .mcp.json, .claude/ 等）が残っているか確認、なければ追加
  - [x] `README.md` を元の内容（CLAUDE.md への誘導）に戻す
  - [x] `biome.json` が作成されていることを確認
- [x] 不要なボイラープレート削除（src/app/page.tsx のデフォルト内容等）

### 1.2 開発環境セットアップ
- [x] Vitest 導入: `bun add -D vitest @vitejs/plugin-react`
- [x] Storybook 導入: `bunx storybook@latest init`
- [x] `.env.local` 雛形作成（環境変数のテンプレート）

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

## Phase 2: 認証（Clerk）（完了）

### 2.1 Clerk セットアップ
- [x] Clerk アカウント作成、アプリケーション作成
- [x] `@clerk/nextjs` インストール
- [x] 環境変数設定（CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY）
- [x] ClerkProvider でアプリをラップ
- [x] ミドルウェア設定（`src/proxy.ts`）

### 2.2 認証画面
- [x] `/sign-in` - Clerk の SignIn コンポーネント配置
- [x] `/sign-up` - Clerk の SignUp コンポーネント配置
- [x] リダイレクト設定（ログイン後の遷移先: `/dashboard`）

### 2.3 Clerk Webhook
- [x] Webhook エンドポイント作成（`/api/webhooks/clerk`）
- [x] 署名検証実装（svix）
- [ ] **後で設定**: Clerk Dashboard での Webhook URL 登録・Signing Secret 取得
- [ ] **後で設定**: user.created → users テーブルに INSERT（Phase 3 完了後）
- [ ] **後で設定**: user.updated → users テーブルを UPDATE（Phase 3 完了後）

**注意:**
- Webhook の Clerk Dashboard 設定・実際の DB 連携は Phase 3（Supabase）完了後に実施
- 開発中は認証モックを使用（後続タスクで実装）

**参照:** `docs/04-api/endpoints.md`

---

## Phase 3: DB（Supabase）（完了）

### 3.1 Supabase セットアップ
- [x] Supabase プロジェクト作成
- [x] 環境変数設定（SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY）
- [x] `@supabase/supabase-js` インストール
- [x] Supabase クライアント作成（`lib/db/client.ts`）

### 3.2 テーブル作成
- [x] SQL実行（`docs/03-database/tables.md` の全テーブル作成スクリプト）
- [x] teams
- [x] users
- [x] team_members
- [x] team_invitations
- [x] jobs
- [x] applicants
- [x] resumes
- [x] notes

### 3.3 Storage セットアップ
- [x] `resumes` バケット作成（履歴書PDF用）
- [x] アクセスポリシー設定（認証済みユーザーのみ）

### 3.4 型生成
- [x] Supabase CLI で型生成
- [x] `types/database.ts` に配置

**参照:** `docs/03-database/tables.md`, `docs/03-database/er-diagram.md`

---

## Phase 4: 基本API実装（完了）

### 4.1 共通処理
- [x] 認証モック（開発時Clerk不要）
- [x] 認証ミドルウェア（Clerk セッション検証 / モック切替）
- [x] チーム所属チェック関数
- [x] エラーハンドリング共通化
- [x] レスポンス形式の統一

### 4.2 チーム API
- [x] `GET /api/teams` - 所属チーム一覧
- [x] `POST /api/teams` - チーム作成

### 4.3 招待 API
- [x] `POST /api/teams/:teamId/invitations` - 招待リンク発行
- [x] `GET /api/invitations/:token` - 招待検証（認証不要）
- [x] `POST /api/invitations/:token/accept` - 招待受け入れ

### 4.4 求人 API
- [x] `GET /api/teams/:teamId/jobs` - 求人一覧
- [x] `POST /api/teams/:teamId/jobs` - 求人作成
- [x] `GET /api/teams/:teamId/jobs/:jobId` - 求人詳細
- [x] `PATCH /api/teams/:teamId/jobs/:jobId` - 求人更新

### 4.5 応募者 API
- [x] `GET /api/teams/:teamId/applicants` - 応募者一覧（フィルタ、ページネーション）
- [x] `POST /api/teams/:teamId/applicants` - 応募者登録
- [x] `GET /api/teams/:teamId/applicants/:applicantId` - 応募者詳細
- [x] `PATCH /api/teams/:teamId/applicants/:applicantId` - 応募者更新

### 4.6 メモ API
- [x] `GET /api/teams/:teamId/applicants/:applicantId/notes` - メモ一覧
- [x] `POST /api/teams/:teamId/applicants/:applicantId/notes` - メモ追加

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

**重要: UI開発フロー**
```
1. コンポーネント/画面を作成
2. Storybook で確認可能な状態にする
3. ユーザーにレビュー依頼
4. OK が出たら次のタスクへ
```

各タスクは Storybook でレビュー可能な単位で分割。
UIライブラリは **shadcn/ui** を使用。

---

### 6.1 shadcn/ui セットアップ
- [ ] shadcn/ui 初期化（`bunx shadcn@latest init`）
- [ ] 基本コンポーネント追加（Button, Input, Card, Badge, etc.）
- [ ] カラーテーマ設定（必要なら）

### 6.2 Storybook 設定（※導入は Phase 1.2 で完了済み前提）
- [ ] shadcn/ui コンポーネントの Story 作成
- [ ] Storybook の設定調整（Tailwind 対応等）
- [ ] **レビュー:** `bun run storybook` で起動し、基本コンポーネントが確認できる状態

---

### 6.3 共通UIコンポーネント

**6.3.1 レイアウト系**
- [ ] AppShell（サイドバー + メインコンテンツ）
- [ ] Header（ロゴ、ナビ、ユーザーメニュー）
- [ ] Sidebar（ナビゲーション）
- [ ] **レビュー:** Storybook で確認

**6.3.2 データ表示系**
- [ ] StatusBadge（応募ステータス表示）
- [ ] SkillTag（スキルタグ）
- [ ] StarRating（星評価 1-5）
- [ ] EmptyState（データなし時の表示）
- [ ] **レビュー:** Storybook で確認

**6.3.3 フォーム系**
- [ ] FileUpload（PDFアップロード、ドラッグ&ドロップ対応）
- [ ] SearchInput（検索入力）
- [ ] FilterSelect（フィルター選択）
- [ ] **レビュー:** Storybook で確認

**6.3.4 フィードバック系**
- [ ] LoadingSpinner / Skeleton
- [ ] ErrorMessage
- [ ] SuccessToast
- [ ] **レビュー:** Storybook で確認

---

### 6.4 オンボーディング画面

**6.4.1 チーム作成画面**
- [ ] `/onboarding` - チーム名入力フォーム
- [ ] バリデーション、エラー表示
- [ ] **レビュー:** Storybook で確認

**6.4.2 フロー実装**
- [ ] チーム未所属時のリダイレクト処理
- [ ] 作成後のダッシュボードへの遷移

---

### 6.5 招待フロー画面

**6.5.1 招待リンク画面**
- [ ] `/invite/[token]` - 招待情報表示
- [ ] 未ログイン時: ログイン誘導
- [ ] ログイン済み: 参加確認
- [ ] **レビュー:** Storybook で確認（各状態）

**6.5.2 フロー実装**
- [ ] 招待検証 API 連携
- [ ] 参加処理 → ダッシュボードへ遷移

---

### 6.6 求人管理画面

**6.6.1 求人一覧画面**
- [ ] `/jobs` - 求人カード一覧
- [ ] 新規作成ボタン
- [ ] 求人カードコンポーネント（タイトル、ステータス、応募者数）
- [ ] **レビュー:** Storybook で確認

**6.6.2 求人作成・編集画面**
- [ ] `/jobs/new` - 求人作成フォーム
- [ ] `/jobs/[id]/edit` - 求人編集フォーム
- [ ] フォームフィールド（タイトル、説明、要件、ステータス）
- [ ] **レビュー:** Storybook で確認

**6.6.3 フロー実装**
- [ ] API 連携（CRUD）
- [ ] 作成/編集後のリダイレクト

---

### 6.7 応募者一覧画面

**6.7.1 一覧UI**
- [ ] `/applicants` - 応募者テーブル/カード一覧
- [ ] 各行: 名前、応募求人、ステータス、評価、日付
- [ ] **レビュー:** Storybook で確認

**6.7.2 フィルター・検索**
- [ ] ステータスフィルター
- [ ] 求人フィルター
- [ ] 名前検索
- [ ] **レビュー:** Storybook で確認

**6.7.3 ページネーション**
- [ ] ページネーションコンポーネント
- [ ] URL パラメータ連携
- [ ] **レビュー:** Storybook で確認

**6.7.4 フロー実装**
- [ ] API 連携（一覧取得、フィルタ、ページネーション）

---

### 6.8 応募者登録画面

**6.8.1 登録フォーム**
- [ ] `/applicants/new` - 応募者情報入力フォーム
- [ ] フィールド: 氏名、メール、電話、応募求人
- [ ] 履歴書アップロード（FileUpload 使用）
- [ ] **レビュー:** Storybook で確認

**6.8.2 フロー実装**
- [ ] API 連携（応募者作成、履歴書アップロード）
- [ ] AI解析の自動実行（オプション）

---

### 6.9 応募者詳細画面（メイン画面）

**6.9.1 基本情報セクション**
- [ ] `/applicants/[id]` - 応募者詳細レイアウト
- [ ] ヘッダー: 名前、ステータス、評価
- [ ] 基本情報: メール、電話、応募求人、応募日
- [ ] **レビュー:** Storybook で確認

**6.9.2 AI解析結果セクション**
- [ ] 解析結果カード（スキル、経験年数、学歴等）
- [ ] 解析中/未解析の状態表示
- [ ] 再解析ボタン
- [ ] **レビュー:** Storybook で確認

**6.9.3 履歴書セクション**
- [ ] PDFプレビュー or ダウンロードリンク
- [ ] 抽出テキスト表示（折りたたみ）
- [ ] **レビュー:** Storybook で確認

**6.9.4 メモ・評価セクション**
- [ ] メモ一覧（時系列）
- [ ] メモ追加フォーム
- [ ] 評価（星）変更UI
- [ ] **レビュー:** Storybook で確認

**6.9.5 フロー実装**
- [ ] API 連携（詳細取得、メモ追加、評価更新、AI解析）

---

### 6.10 チーム設定画面（MVP後）

**6.10.1 設定画面UI**
- [ ] `/settings` - チーム設定レイアウト
- [ ] チーム名編集
- [ ] メンバー一覧
- [ ] **レビュー:** Storybook で確認

**6.10.2 招待機能**
- [ ] 招待リンク発行ボタン
- [ ] 発行済みリンク一覧
- [ ] **レビュー:** Storybook で確認

**6.10.3 フロー実装**
- [ ] API 連携

---

**参照:** `docs/06-ui/screens.md`, `docs/02-architecture/tech-stack.md`

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
