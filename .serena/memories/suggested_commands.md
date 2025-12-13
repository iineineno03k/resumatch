# 開発コマンド一覧

## 基本コマンド

### 開発サーバー
```bash
bun run dev          # Next.js 開発サーバー起動
bun run storybook    # Storybook 起動 (port 6006)
```

### ビルド
```bash
bun run build           # Next.js 本番ビルド
bun run build-storybook # Storybook ビルド
```

### テスト
```bash
bun run test      # Vitest (watch モード)
bun run test:run  # Vitest (single run)
```

### リント・フォーマット
```bash
bun run lint      # Biome check
bun run format    # Biome format --write
```

### 本番サーバー
```bash
bun run start     # Next.js 本番サーバー起動
```

## パッケージ管理
```bash
bun add <package>      # 依存追加
bun add -D <package>   # devDependencies に追加
bun install            # 依存インストール
```

## Git コミットメッセージ
プレフィックス必須、日本語で記述:
- `feat:` 新機能追加
- `fix:` バグ修正
- `docs:` ドキュメントのみの変更
- `refactor:` リファクタリング
- `style:` コードフォーマット
- `test:` テストの追加・修正
- `chore:` ビルド、依存関係、設定等

例:
```bash
git commit -m "feat: 応募者一覧のフィルター機能を追加"
```

## システムコマンド (Darwin/macOS)
```bash
ls -la              # ファイル一覧
find . -name "*.ts" # ファイル検索
grep -r "pattern" . # パターン検索
```
