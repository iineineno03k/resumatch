# E2Eテスト エラー記録

## テスト実施日
2025-12-18（最終更新）

## エラー一覧

### 1. ハイドレーションエラー（求人作成ページ） - 解決済み
- **ページ**: `/jobs/new`
- **事象**: `A tree hydrated but some attributes of the server rendered HTML didn't match the client prop...`
- **影響**: 機能自体は動作するが、コンソールエラーが出る
- **再現手順**: `/jobs/new` にアクセス
- **修正状況**: **再現せず** - 一時的な問題だった可能性。ビルドも成功。

### 2. 履歴書アップロード失敗（環境変数未設定） - 解決済み
- **ページ**: `/applicants/new`（履歴書付きで応募者登録時）
- **事象**: `Error: NEXT_PUBLIC_SUPABASE_URL is not set`
- **影響**: 履歴書ファイルのアップロードができない
- **原因**: Supabase Storage の環境変数が未設定
- **修正内容**:
  - `src/lib/db/storage.ts` にローカルストレージアダプターを追加
  - `USE_LOCAL_STORAGE=true` 環境変数でローカルファイルシステムを使用可能に
  - `/api/resumes/[...path]/route.ts` でローカルファイル配信APIを作成
  - `/api/resumes/[id]/download/route.ts` でPDFダウンロードAPIを作成
- **テスト結果**: 正常動作確認済み（ローカルストレージモード）

---

## テスト結果サマリ

| # | テストケース | 結果 | 備考 |
|---|-------------|------|------|
| 1-1 | トップページ表示 | OK | |
| 1-2 | サインインページ | OK | モック認証表示 |
| 1-3 | サインアップページ | OK | モックモードでsign-inにリダイレクト |
| 2-1 | ログイン後遷移 | OK | /jobs に遷移（会社作成済みのため） |
| 3-1 | 求人一覧表示 | OK | |
| 3-2 | 求人作成フォーム | OK | ハイドレーションエラー再現せず |
| 3-3 | 求人作成成功 | OK | E2Eテスト用求人を作成 |
| 3-4 | 求人詳細表示 | OK | |
| 3-5 | 求人編集ページ | OK | |
| 4-1 | 応募者一覧表示 | OK | |
| 4-2 | フィルター機能 | OK | ステータス、求人でフィルタリング動作確認 |
| 4-3 | 検索機能 | OK | 名前検索動作確認 |
| 4-4 | ページネーション | OK | 11件のデータでページ切替確認 |
| 4-5 | 応募者登録フォーム | OK | |
| 4-6 | 応募者登録成功 | OK | E2Eテスト花子を登録 |
| 4-7 | 応募者詳細表示 | OK | |
| 4-8 | メモ追加 | OK | |
| 4-9 | ステータス変更 | OK | ドロップダウンでステータス変更動作確認 |
| 4-10 | 履歴書アップロード | OK | ローカルストレージモードで動作確認 |
| 4-11 | PDFダウンロード | OK | 履歴書PDFダウンロード動作確認 |
| 4-12 | AI解析実行 | OK | モックモードで動作確認（USE_AI_MOCK=true） |
| 5-1 | 招待リンク（有効） | OK | 既存メンバーへの適切なメッセージ表示確認 |
| 5-2 | 招待リンク（無効） | OK | エラーページ表示 |
| 6-1 | ナビゲーション | OK | 求人・応募者リンク動作確認済み |

---

## ビルド結果

```
$ bun run build
✓ Compiled successfully in 2.9s
✓ Generating static pages (11/11) in 509.7ms

警告:
- middleware file convention is deprecated (proxy への移行推奨)
```

**ビルドエラー: なし**

---

## 実装した修正内容

### AI解析モック対応
開発環境でGoogle AI APIなしにAI解析を動作確認可能にするため、以下を実装:

1. **`src/lib/ai/pdf-extract.ts`**: PDF抽出モック
   - `USE_AI_MOCK=true` でモックテキストを返す

2. **`src/lib/ai/analyze-resume.ts`**: AI解析モック
   - `USE_AI_MOCK=true` でモック解析結果を返す
   - スキル、経歴、学歴、資格の固定データを返す

### ローカルストレージ対応
開発環境でSupabaseなしに履歴書アップロード・ダウンロードを可能にするため、以下を実装:

1. **`src/lib/db/storage.ts`**: ストレージアダプター
   - `USE_LOCAL_STORAGE=true` で切替可能
   - ローカル: `uploads/resumes/{companyId}/{applicantId}/{fileName}` に保存
   - 本番: Supabase Storage を使用

2. **`src/app/api/resumes/[...path]/route.ts`**: ローカルファイル配信API
   - パストラバーサル攻撃対策済み
   - 認証チェック付き

3. **`src/app/api/resumes/[id]/download/route.ts`**: PDFダウンロードAPI
   - resume.id から履歴書を検索
   - 会社所属チェック（アクセス権限確認）
   - ローカル/Supabase両対応

---

## 結論

**すべての主要機能が正常に動作しています。**

- トップページ、認証フロー: OK
- 求人管理（一覧、作成、詳細、編集）: OK
- 応募者管理（一覧、登録、詳細、メモ追加、ステータス変更）: OK
- 履歴書（アップロード、ダウンロード）: OK（USE_LOCAL_STORAGE=true）
- AI解析: OK（USE_AI_MOCK=true でモック動作確認済み）
- 検索・フィルター・ページネーション: OK
- 招待フロー（有効/無効リンク処理）: OK
- ナビゲーション: OK

### 本番環境での追加設定

本番環境では以下の環境変数が必要:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase サービスロールキー
- `GOOGLE_AI_API_KEY`: Google Gemini API キー（AI解析用）

開発環境では `USE_LOCAL_STORAGE=true` を設定することで、Supabaseなしに動作確認が可能。
