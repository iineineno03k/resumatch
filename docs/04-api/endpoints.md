# API エンドポイント一覧

## 概要

Next.js API Routes で実装。認証は Clerk を使用。

**ベースURL**: `/api`

## 認証

全APIは Clerk の認証が必要（一部除く）。
リクエストヘッダーに Clerk のセッショントークンを含める。

```
Authorization: Bearer <clerk_session_token>
```

---

## エンドポイント一覧

### 認証系（Clerk Webhook）

| Method | Path | 説明 | MVP |
|--------|------|------|-----|
| POST | `/api/webhooks/clerk` | Clerkからのユーザー作成/更新通知 | ○ |

### チーム

| Method | Path | 説明 | MVP |
|--------|------|------|-----|
| GET | `/api/teams` | 自分が所属するチーム一覧 | ○ |
| POST | `/api/teams` | チーム作成 | ○ |
| GET | `/api/teams/:teamId` | チーム詳細 | △ |
| PATCH | `/api/teams/:teamId` | チーム更新 | △ |

### 招待（Invitations）

| Method | Path | 説明 | MVP |
|--------|------|------|-----|
| POST | `/api/teams/:teamId/invitations` | 招待リンク発行 | ○ |
| GET | `/api/teams/:teamId/invitations` | 招待一覧 | △ |
| DELETE | `/api/teams/:teamId/invitations/:invitationId` | 招待取消 | △ |
| GET | `/api/invitations/:token` | 招待リンク検証（認証不要） | ○ |
| POST | `/api/invitations/:token/accept` | 招待を受け入れる | ○ |

### 求人（Jobs）

| Method | Path | 説明 | MVP |
|--------|------|------|-----|
| GET | `/api/teams/:teamId/jobs` | 求人一覧 | ○ |
| POST | `/api/teams/:teamId/jobs` | 求人作成 | ○ |
| GET | `/api/teams/:teamId/jobs/:jobId` | 求人詳細 | ○ |
| PATCH | `/api/teams/:teamId/jobs/:jobId` | 求人更新 | ○ |
| DELETE | `/api/teams/:teamId/jobs/:jobId` | 求人削除 | △ |

### 応募者（Applicants）

| Method | Path | 説明 | MVP |
|--------|------|------|-----|
| GET | `/api/teams/:teamId/applicants` | 応募者一覧（フィルタ可） | ○ |
| POST | `/api/teams/:teamId/applicants` | 応募者登録 | ○ |
| GET | `/api/teams/:teamId/applicants/:applicantId` | 応募者詳細 | ○ |
| PATCH | `/api/teams/:teamId/applicants/:applicantId` | 応募者更新（ステータス変更等） | ○ |
| DELETE | `/api/teams/:teamId/applicants/:applicantId` | 応募者削除 | △ |

### 履歴書（Resume）

| Method | Path | 説明 | MVP |
|--------|------|------|-----|
| POST | `/api/teams/:teamId/applicants/:applicantId/resume` | 履歴書アップロード | ○ |
| GET | `/api/teams/:teamId/applicants/:applicantId/resume` | 履歴書取得（AI解析結果含む） | ○ |
| POST | `/api/teams/:teamId/applicants/:applicantId/resume/analyze` | AI解析を実行 | ○ |

### メモ（Notes）

| Method | Path | 説明 | MVP |
|--------|------|------|-----|
| GET | `/api/teams/:teamId/applicants/:applicantId/notes` | メモ一覧 | ○ |
| POST | `/api/teams/:teamId/applicants/:applicantId/notes` | メモ追加 | ○ |
| PATCH | `/api/teams/:teamId/applicants/:applicantId/notes/:noteId` | メモ更新 | △ |
| DELETE | `/api/teams/:teamId/applicants/:applicantId/notes/:noteId` | メモ削除 | △ |

---

## 詳細仕様

### POST `/api/webhooks/clerk`

Clerk からユーザー作成/更新の通知を受け取り、`users` テーブルに同期。

**リクエスト**: Clerk Webhook payload（署名検証必須）

**処理**:
- `user.created`: users テーブルに INSERT
- `user.updated`: users テーブルを UPDATE
- `user.deleted`: users テーブルから DELETE

---

### POST `/api/teams/:teamId/invitations`

招待リンクを発行する。owner/admin のみ実行可能。

**リクエストボディ**:

```json
{
  "role": "member"
}
```

**処理**:
1. ランダムなtokenを生成（nanoid等）
2. 有効期限を設定（デフォルト7日後）
3. team_invitations テーブルに INSERT
4. 招待URLを返す

**レスポンス**:

```json
{
  "id": "uuid",
  "token": "abc123xyz...",
  "inviteUrl": "https://resumatch.com/invite/abc123xyz...",
  "role": "member",
  "expiresAt": "2025-01-08T00:00:00Z"
}
```

---

### GET `/api/invitations/:token`

招待リンクの検証。**認証不要**。

招待リンクをクリックしたユーザーが、ログイン前に招待内容を確認するために使用。

**処理**:
1. tokenで team_invitations を検索
2. 有効期限チェック
3. 使用済みチェック（used_at が NULL かどうか）

**レスポンス（有効な場合）**:

```json
{
  "valid": true,
  "team": {
    "id": "uuid",
    "name": "株式会社サンプル"
  },
  "role": "member",
  "expiresAt": "2025-01-08T00:00:00Z"
}
```

**レスポンス（無効な場合）**:

```json
{
  "valid": false,
  "reason": "expired"
}
```

reason の値:
- `expired`: 有効期限切れ
- `used`: 使用済み
- `not_found`: トークンが存在しない

---

### POST `/api/invitations/:token/accept`

招待を受け入れてチームに参加する。**認証必須**。

**処理**:
1. tokenで team_invitations を検索
2. 有効性チェック（期限、使用済み）
3. team_members に INSERT
4. team_invitations.used_at を更新

**レスポンス**:

```json
{
  "teamId": "uuid",
  "teamName": "株式会社サンプル",
  "role": "member"
}
```

**招待フロー全体**:

```
1. オーナーが POST /api/teams/:teamId/invitations で招待リンク発行
2. 招待された人がリンク（/invite/:token）にアクセス
3. フロントエンドが GET /api/invitations/:token で検証
4. 未ログインなら → Clerkでサインアップ/ログイン
5. ログイン後 → POST /api/invitations/:token/accept で参加
6. チームのページにリダイレクト
```

---

### GET `/api/teams/:teamId/jobs`

**クエリパラメータ**:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| status | string | `open` / `closed` でフィルタ |

**レスポンス**:

```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "バックエンドエンジニア",
      "status": "open",
      "applicantCount": 5,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/teams/:teamId/jobs`

**リクエストボディ**:

```json
{
  "title": "バックエンドエンジニア",
  "description": "募集要項...",
  "requirements": "必須スキル..."
}
```

**レスポンス**:

```json
{
  "id": "uuid",
  "title": "バックエンドエンジニア",
  "description": "募集要項...",
  "requirements": "必須スキル...",
  "status": "open",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### GET `/api/teams/:teamId/applicants`

**クエリパラメータ**:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| jobId | uuid | 求人でフィルタ |
| status | string | ステータスでフィルタ |
| page | number | ページ番号（デフォルト: 1） |
| limit | number | 件数（デフォルト: 20） |

**レスポンス**:

```json
{
  "applicants": [
    {
      "id": "uuid",
      "name": "山田太郎",
      "email": "yamada@example.com",
      "status": "screening",
      "jobTitle": "バックエンドエンジニア",
      "appliedAt": "2025-01-01T00:00:00Z",
      "hasResume": true,
      "aiSummary": "Java 5年、PM経験あり..."
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### POST `/api/teams/:teamId/applicants`

**リクエストボディ**:

```json
{
  "jobId": "uuid",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "phone": "090-1234-5678"
}
```

**レスポンス**: 作成された応募者オブジェクト

---

### POST `/api/teams/:teamId/applicants/:applicantId/resume`

**リクエスト**: `multipart/form-data`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| file | File | PDFファイル |

**処理フロー**:
1. Supabase Storage にアップロード
2. `resumes` テーブルに INSERT（`analysis_status = 'pending'`）
3. 非同期で AI 解析をキュー（または即時実行）

**レスポンス**:

```json
{
  "id": "uuid",
  "fileUrl": "https://...",
  "fileName": "resume.pdf",
  "analysisStatus": "pending"
}
```

---

### POST `/api/teams/:teamId/applicants/:applicantId/resume/analyze`

手動で AI 解析を実行（再解析用）。

**処理フロー**:
1. `resumes.analysis_status` を `processing` に更新
2. PDF からテキスト抽出（pdfjs-dist）
3. テキストが取れなければ OCR（Tesseract.js）
4. Gemini API でテキストを構造化
5. 結果を `resumes.ai_analysis` に保存
6. `analysis_status` を `completed` に更新

**レスポンス**:

```json
{
  "id": "uuid",
  "analysisStatus": "completed",
  "aiAnalysis": {
    "summary": "Java 5年、PM経験2年...",
    "skills": ["Java", "Spring Boot", "AWS"],
    "experience": [...],
    "education": [...],
    "certifications": [...]
  }
}
```

---

### GET `/api/teams/:teamId/applicants/:applicantId`

**レスポンス**:

```json
{
  "id": "uuid",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "phone": "090-1234-5678",
  "status": "first_interview",
  "appliedAt": "2025-01-01T00:00:00Z",
  "job": {
    "id": "uuid",
    "title": "バックエンドエンジニア"
  },
  "resume": {
    "id": "uuid",
    "fileUrl": "https://...",
    "fileName": "resume.pdf",
    "analysisStatus": "completed",
    "aiAnalysis": {
      "summary": "...",
      "skills": [...],
      "experience": [...],
      "education": [...],
      "certifications": [...]
    }
  },
  "notes": [
    {
      "id": "uuid",
      "content": "技術力は高い",
      "rating": 4,
      "user": {
        "name": "田中",
        "avatarUrl": "..."
      },
      "createdAt": "2025-01-02T00:00:00Z"
    }
  ]
}
```

---

### PATCH `/api/teams/:teamId/applicants/:applicantId`

**リクエストボディ**:

```json
{
  "status": "first_interview"
}
```

または

```json
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "phone": "090-0000-0000"
}
```

---

### POST `/api/teams/:teamId/applicants/:applicantId/notes`

**リクエストボディ**:

```json
{
  "content": "技術力は高い。コミュニケーションも問題なし。",
  "rating": 4
}
```

**レスポンス**: 作成されたメモオブジェクト

---

## エラーレスポンス

全APIで共通のエラーフォーマット：

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "応募者が見つかりません"
  }
}
```

**エラーコード**:

| コード | HTTP Status | 説明 |
|--------|-------------|------|
| UNAUTHORIZED | 401 | 認証エラー |
| FORBIDDEN | 403 | 権限なし（他チームのリソース等） |
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | バリデーションエラー |
| INTERNAL_ERROR | 500 | サーバーエラー |

---

## 凡例

- ○ = MVP必須
- △ = あれば良い
