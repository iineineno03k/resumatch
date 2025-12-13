# 技術スタック

## 概要図

```
┌─────────────────────────────────────────────────────────┐
│  ResuMatch - 技術スタック                                │
├─────────────────────────────────────────────────────────┤
│  フロントエンド                                          │
│    - Next.js 15 (App Router)                            │
│    - React 19                                           │
│    - TypeScript                                         │
│    - Storybook（一部コンポーネント）                      │
│                                                         │
│  バックエンド                                            │
│    - Next.js API Routes（TypeScript統一）               │
│                                                         │
│  認証                                                   │
│    - Clerk                                              │
│                                                         │
│  DB                                                     │
│    - Supabase (PostgreSQL)                              │
│    - マルチテナント考慮した設計                           │
│                                                         │
│  AI/PDF処理                                             │
│    - pdfjs-dist（テキスト抽出）                          │
│    - Tesseract.js（OCRフォールバック）                   │
│    - Google Gemini API（履歴書解析・構造化）             │
│                                                         │
│  テスト                                                 │
│    - Vitest                                             │
│                                                         │
│  開発ツール                                              │
│    - Bun（パッケージマネージャー）                        │
│                                                         │
│  インフラ                                                │
│    - Vercel (Free)                                      │
│    - Supabase (Free)                                    │
└─────────────────────────────────────────────────────────┘
```

## 各技術の選定理由

### フロントエンド: Next.js 15 + React 19

- 最新のApp Router でモダンな設計
- React 19 の新機能（Server Components等）を活用
- Vercelデプロイが簡単

### 認証: Clerk

- Supabase Authは特殊なハッシュを使用するため避けた
- Clerkは実装が簡単でUI込みで提供される
- Webhook連携でユーザー情報をDBに同期可能

### DB: Supabase (PostgreSQL)

- 無料枠が十分
- PostgreSQLで堅牢
- Row Level Security（RLS）でマルチテナント対応可能
- Storage機能でPDFアップロードも対応

### AI: Google Gemini API

- 無料枠が大きい（1M+ tokens/分）
- クレジットカード登録不要
- 日本語対応が良い

### PDF処理

| 処理 | ライブラリ | 用途 |
|------|-----------|------|
| テキスト抽出 | pdfjs-dist | テキストベースPDF |
| OCR | Tesseract.js | スキャンPDF（フォールバック） |

### テスト: Vitest

- 高速
- Jest互換
- TypeScriptネイティブ対応

### パッケージマネージャー: Bun

- npm/yarnより高速
- TypeScriptをネイティブ実行可能

## インフラ構成

```
[ユーザー]
    ↓
[Vercel] ← Next.js アプリ
    ↓
[Clerk] ← 認証
    ↓
[Supabase]
  ├── PostgreSQL（データ）
  └── Storage（PDF）
    ↓
[Google Gemini API] ← AI解析
```

## 費用

| サービス | プラン | 費用 |
|----------|--------|------|
| Vercel | Hobby | 無料 |
| Supabase | Free | 無料 |
| Clerk | Free | 無料（MAU 10,000まで） |
| Gemini API | Free | 無料（レート制限あり） |

**合計: 無料**
