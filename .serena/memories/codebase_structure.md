# コードベース構造

```
resumatch/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 認証必須ページ
│   │   ├── (public)/           # 認証不要ページ
│   │   ├── api/                # API Routes
│   │   ├── invite/[token]/     # 招待リンク
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # トップページ
│   │   └── globals.css         # グローバルスタイル
│   ├── components/
│   │   ├── ui/                 # 汎用UI (Button, Input 等)
│   │   └── features/           # 機能別コンポーネント
│   ├── lib/
│   │   ├── db/                 # Supabase クライアント
│   │   ├── ai/                 # AI処理モジュール
│   │   └── utils/              # 汎用ユーティリティ
│   ├── types/                  # 型定義
│   ├── hooks/                  # カスタムフック
│   └── stories/                # Storybook ストーリー
├── docs/                       # 設計ドキュメント
│   ├── 00-tasks/               # タスク管理
│   ├── 01-requirements/        # 要件定義
│   ├── 02-architecture/        # 技術設計
│   ├── 03-database/            # DB設計
│   ├── 04-api/                 # API設計
│   ├── 05-ai-module/           # AI処理仕様
│   └── 06-ui/                  # 画面設計
├── public/                     # 静的ファイル
├── .storybook/                 # Storybook 設定
├── package.json
├── biome.json                  # Biome 設定
├── tsconfig.json               # TypeScript 設定
├── vitest.config.ts            # Vitest 設定
├── next.config.ts              # Next.js 設定
└── CLAUDE.md                   # プロジェクトルール (重要)
```

## 設定ファイル
- `biome.json` - Linter/Formatter 設定
- `vitest.config.ts` - テスト設定
- `.env.local` - 環境変数 (git ignore)
- `.env.local.example` - 環境変数テンプレート
