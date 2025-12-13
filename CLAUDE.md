# ResuMatch - プロジェクトルール

このファイルはClaude Codeおよび開発者が従うべきルールを定義します。

---

## 次にやること

**`/task` コマンドを実行して現在のタスクを確認してください。**

または `docs/00-tasks/implementation-tasks.md` を読んでください。

### タスク管理コマンド

| コマンド | 説明 |
|---------|------|
| `/task` | 現在のタスク状況を確認 |
| `/task-done` | 現在の Phase を完了にして次へ進む |
| `/task-update` | 個別タスクを完了にする |

**Phase 完了時は必ず `/task-done` を実行してください。**

---

## プロジェクト概要

- **サービス名**: ResuMatch（レジュマッチ）
- **概要**: 採用管理SaaS + AI履歴書解析
- **目的**: ポートフォリオとして受託案件獲得に活用

## ドキュメント

設計ドキュメントは `docs/` 配下を参照：

- `docs/README.md` - ドキュメント目次
- `docs/00-tasks/implementation-tasks.md` - **実装タスク一覧（進捗管理）**
- `docs/01-requirements/` - 要件定義
- `docs/02-architecture/` - 技術設計
- `docs/03-database/` - DB設計
- `docs/04-api/` - API設計
- `docs/05-ai-module/` - AI処理仕様
- `docs/06-ui/` - 画面設計
- `docs/06-ui/frontend-standards.md` - **フロントエンド実装標準（実装時は必ず参照）**
- `docs/06-ui/nextjs-basic-principle/` - **Next.js App Router 設計入門（実装の正）**

---

## 絶対に守るべきルール

### 0. フロントエンド実装標準の遵守

**フロントエンド（React/Next.js）のコードを書く際は、必ず以下を参照してください:**

1. `docs/06-ui/frontend-standards.md` - 実装標準とインデックス
2. `docs/06-ui/nextjs-basic-principle/` - 詳細な設計指針（実装の正）

実装シーンに応じて、frontend-standards.md のインデックスから該当する章を参照すること。

**特に重要なルール:**
- **データフェッチは Server Components で行う** - Client でのフェッチは原則禁止
- **useEffect は外部システムとの同期専用** - 派生値計算や内部状態管理には使用禁止
- **Client Components は必要最小限に** - `"use client"` の影響範囲を理解する
- **データ操作は Server Actions で行う** - revalidate との連携を活用

### 1. 個人情報の取り扱い

このシステムは応募者の個人情報（氏名、メール、電話番号、履歴書）を扱います。

**禁止事項:**

- ログに個人情報を出力しない
  - 氏名、メールアドレス、電話番号
  - 履歴書の内容（テキスト、AI解析結果）
  - その他センシティブな情報
- console.log でユーザーデータをそのまま出力しない
- エラーログに個人情報を含めない

**OK例:**
```typescript
console.log(`Applicant created: id=${applicant.id}`);
console.error(`Failed to process resume: applicantId=${applicantId}`);
```

**NG例:**
```typescript
// 絶対にやらない
console.log(`Applicant: ${applicant.name}, ${applicant.email}`);
console.log(`Resume text: ${resume.extractedText}`);
console.error(`Error for user ${applicant.email}: ${error}`);
```

### 2. アクセス制御

**必須:**

- 全APIでチーム所属チェックを行う
- 他チームのデータにアクセスできないようにする
- team_id によるフィルタリングを必ず入れる

**実装パターン:**
```typescript
// 必ずチームメンバーシップを確認
const membership = await db.teamMembers.findFirst({
  where: { teamId, userId: currentUser.id }
});
if (!membership) {
  throw new ForbiddenError('このチームへのアクセス権限がありません');
}

// データ取得時は必ず team_id でフィルタ
const applicants = await db.applicants.findMany({
  where: { teamId }  // 必須
});
```

### 3. 認証

- Clerk を使用
- 認証なしでアクセス可能なAPIは Webhook のみ
- Webhook は署名検証必須

---

## 技術スタック

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui（UIコンポーネント）
- Bun（パッケージマネージャー）
- Biome（Linter + Formatter）
- Vitest（テスト）
- Storybook（UIレビュー用）
- Clerk（認証）
- Supabase（PostgreSQL + Storage）
- Google Gemini API（AI解析）

### UI開発フロー

フロントエンド実装は以下のフローで進める:

1. コンポーネント/画面を作成
2. Storybook で確認可能な状態にする
3. ユーザーにレビュー依頼
4. OK が出たら次のタスクへ

**Storybook でのレビューを経てから次に進むこと。**

---

## コーディング規約

### ファイル構成

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/          # 認証済みページ
│   ├── api/             # API Routes
│   └── ...
├── components/          # UIコンポーネント
├── lib/                 # ユーティリティ
│   ├── db/              # DB操作
│   ├── ai/              # AI処理（PDF解析、Gemini連携）
│   └── ...
└── types/               # 型定義
```

### 命名規則

- ファイル: `kebab-case.ts`
- コンポーネント: `PascalCase.tsx`
- 関数/変数: `camelCase`
- 定数: `UPPER_SNAKE_CASE`
- 型/Interface: `PascalCase`

### テスト

- AI/PDF処理は単体テストを必ず書く
- モジュール単位でテスト可能な設計にする
- 個人情報を含むテストデータはモック化する

### コード品質チェック（必須）

**実装時は必ず以下を実行してエラーがないことを確認すること:**

```bash
bun run check:fix   # Linter + Formatter（自動修正）
bun run typecheck   # TypeScript 型チェック
```

- コミット前に必ず両方を実行する
- エラーが出た場合は修正してからコミットする
- `any` 型の使用は原則禁止（やむを得ない場合は型定義を作成）

---

## DB設計の注意

- カラム追加・型変更は頻繁に発生する前提
- マルチテナント（team_id）を考慮した設計
- 詳細は `docs/03-database/` 参照

---

## コミットメッセージ

**必須ルール:**
- 日本語で書く
- プレフィックスをつける

**プレフィックス一覧:**
| プレフィックス | 用途 |
|---------------|------|
| `feat:` | 新機能追加 |
| `fix:` | バグ修正 |
| `docs:` | ドキュメントのみの変更 |
| `refactor:` | リファクタリング（機能変更なし） |
| `style:` | コードフォーマット、セミコロン等 |
| `test:` | テストの追加・修正 |
| `chore:` | ビルド、依存関係、設定等 |

**例:**
```
feat: 応募者一覧のフィルター機能を追加
fix: ステータス更新時のバリデーションエラーを修正
docs: API仕様書を更新
refactor: 認証処理を共通化
chore: eslint設定を追加
```

---

## その他

- 絵文字は使用しない（ユーザーから明示的に要求された場合を除く）
- ドキュメントは `docs/` に集約し、README.md で索引化
