# ER図

## 全体像

```mermaid
erDiagram
    Team ||--o{ TeamMember : "メンバーを持つ"
    Team ||--o{ TeamInvitation : "招待リンクを持つ"
    Team ||--o{ Job : "求人を持つ"
    Team ||--o{ Applicant : "応募者を持つ"

    User ||--o{ TeamMember : "チームに所属"
    User ||--o{ TeamInvitation : "招待を発行"
    User ||--o{ Note : "メモを書く"

    Job ||--o{ Applicant : "応募を受ける"

    Applicant ||--o| Resume : "履歴書を持つ"
    Applicant ||--o{ Note : "メモがつく"
```

## テーブル詳細

### Team（チーム = 会社）

```mermaid
erDiagram
    Team {
        uuid id PK "主キー"
        string name "会社名（例：株式会社サンプル）"
        string slug "URL用（例：sample-inc）"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }
```

**役割**: 会社単位でデータを分離するためのテーブル（マルチテナント）

**slugとは？**

URLで使う人間が読める識別子。

```
会社名: 株式会社リクルート
slug: recruit

→ URL: https://resumatch.com/recruit/jobs
                              ~~~~~~
                              ここがslug
```

UUIDだと `/a1b2c3d4-xxxx/jobs` みたいになって見づらいので、人間が読めるslugを使う。

---

### User（ユーザー = ログインする人）

```mermaid
erDiagram
    User {
        uuid id PK "主キー"
        string clerk_user_id UK "Clerkから来るID"
        string email "メールアドレス"
        string name "表示名"
        string avatar_url "アイコン画像URL"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }
```

**役割**: ログインユーザーの情報を保存

**Clerkとの関係**:

```
[Clerk（認証サービス）]
    ↓ ログイン成功時にuser_idが来る
[User テーブル]
    clerk_user_id = "user_abc123"  ← これで紐付け
```

---

### TeamMember（誰がどのチームに所属してるか）

```mermaid
erDiagram
    TeamMember {
        uuid id PK "主キー"
        uuid team_id FK "どのチーム"
        uuid user_id FK "どのユーザー"
        string role "権限（owner/admin/member）"
        timestamp created_at "作成日時"
    }
```

**役割**: UserとTeamの多対多を解決する中間テーブル

```
例：田中さんが2つの会社に所属

┌───────────────────────────────────────────────────┐
│ TeamMember                                        │
├───────────────────────────────────────────────────┤
│ team_id=リクルート  user_id=田中  role=owner      │
│ team_id=サンプル社  user_id=田中  role=member     │
└───────────────────────────────────────────────────┘
```

---

### TeamInvitation（招待リンク）

```mermaid
erDiagram
    TeamInvitation {
        uuid id PK "主キー"
        uuid team_id FK "どのチームへの招待か"
        uuid invited_by_user_id FK "誰が発行したか"
        string token UK "招待トークン（URLに含まれる）"
        string role "招待される人の権限（admin/member）"
        timestamp expires_at "有効期限"
        timestamp used_at "使用日時（NULLなら未使用）"
        timestamp created_at "作成日時"
    }
```

**役割**: チームへの招待リンクを管理

**招待フロー**:

```
1. チームオーナーが招待リンクを発行
   → TeamInvitation レコード作成（token生成）

2. 招待リンクをメール等で共有
   → https://resumatch.com/invite/abc123xyz
                                  ~~~~~~~~~
                                  これがtoken

3. 招待された人がリンクをクリック
   → サインアップ or ログイン

4. 認証後、自動的にチームに参加
   → TeamMember レコード作成
   → TeamInvitation.used_at を更新
```

**tokenの仕様**:
- ランダムな文字列（例: nanoid で生成）
- 推測されにくい長さ（21文字以上推奨）
- 1回使用したら無効化（used_at に日時が入る）

**有効期限**:
- デフォルト7日間
- 期限切れの招待リンクは使用不可

---

### Job（求人 = 募集中のポジション）

```mermaid
erDiagram
    Job {
        uuid id PK "主キー"
        uuid team_id FK "どのチームの求人か"
        string title "求人タイトル"
        text description "募集要項の本文"
        text requirements "必須スキル・要件"
        string status "open=募集中 / closed=締切"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }
```

**役割**: 募集ポジションを管理

```
例：リクルートの求人一覧

┌────────────────────────────────────────────────────────┐
│ Job                                                    │
├────────────────────────────────────────────────────────┤
│ team_id=リクルート  title=バックエンドエンジニア  status=open   │
│ team_id=リクルート  title=フロントエンドエンジニア status=open  │
│ team_id=リクルート  title=デザイナー           status=closed   │
└────────────────────────────────────────────────────────┘
```

---

### Applicant（応募者 = 候補者）

```mermaid
erDiagram
    Applicant {
        uuid id PK "主キー"
        uuid team_id FK "どのチームへの応募か"
        uuid job_id FK "どの求人への応募か"
        string name "応募者の名前"
        string email "メールアドレス"
        string phone "電話番号"
        string status "選考ステータス"
        timestamp applied_at "応募日"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }
```

**選考ステータスの流れ**:

```
screening → first_interview → second_interview → offer
(書類選考)    (1次面接)         (2次面接)          (内定)
                                    ↓
                                rejected（不採用）
```

**なぜ team_id を持つか？**

`job_id` から `Job.team_id` を辿れば分かるが、検索効率のために冗長に持たせている。
応募者一覧をチームで絞り込む際、JOINなしで済む。

---

### Resume（履歴書 = PDFとAI解析結果）

```mermaid
erDiagram
    Resume {
        uuid id PK "主キー"
        uuid applicant_id FK "どの応募者の履歴書か（1対1）"
        string file_url "PDFの保存先URL"
        string file_name "ファイル名"
        text extracted_text "PDFから抽出したテキスト"
        jsonb ai_analysis "AIが解析した結果（JSON）"
        string analysis_status "pending/processing/completed/failed"
        timestamp analyzed_at "解析完了日時"
        timestamp created_at "作成日時"
    }
```

**処理の流れ**:

```
1. PDFアップロード → file_url に保存
2. テキスト抽出   → extracted_text に保存
3. AI解析実行    → analysis_status = "processing"
4. 解析完了      → ai_analysis にJSON保存、status = "completed"
```

**ai_analysis の構造**:

```json
{
  "summary": "Java 5年、PM経験2年。金融系システム開発が得意。",
  "skills": ["Java", "Spring Boot", "AWS", "PostgreSQL"],
  "experience": [
    {
      "company": "株式会社〇〇",
      "position": "バックエンドエンジニア",
      "period": "2019年4月〜2024年3月",
      "description": "銀行向け基幹システムの開発..."
    }
  ],
  "education": [
    {
      "school": "〇〇大学",
      "degree": "工学部 情報工学科",
      "period": "2015年4月〜2019年3月"
    }
  ],
  "certifications": ["AWS SAA", "応用情報技術者"]
}
```

---

### Note（メモ = 面接後のフィードバック）

```mermaid
erDiagram
    Note {
        uuid id PK "主キー"
        uuid applicant_id FK "どの応募者へのメモか"
        uuid user_id FK "誰が書いたか"
        text content "メモ内容"
        int rating "評価（1〜5の星）"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }
```

**役割**: 面接官が候補者にコメント・評価を残す

```
例：

┌─────────────────────────────────────────────────────────┐
│ 応募者: 山田太郎                                         │
├─────────────────────────────────────────────────────────┤
│ [田中] ★★★★☆ 技術力は高い。コミュ力も問題なし。         │
│ [佐藤] ★★★☆☆ 経験は十分だが給与希望が高め。            │
└─────────────────────────────────────────────────────────┘
```

---

## 完全版ER図

```mermaid
erDiagram
    Team {
        uuid id PK
        string name
        string slug UK
        timestamp created_at
        timestamp updated_at
    }

    User {
        uuid id PK
        string clerk_user_id UK
        string email
        string name
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }

    TeamMember {
        uuid id PK
        uuid team_id FK
        uuid user_id FK
        string role
        timestamp created_at
    }

    TeamInvitation {
        uuid id PK
        uuid team_id FK
        uuid invited_by_user_id FK
        string token UK
        string role
        timestamp expires_at
        timestamp used_at
        timestamp created_at
    }

    Job {
        uuid id PK
        uuid team_id FK
        string title
        text description
        text requirements
        string status
        timestamp created_at
        timestamp updated_at
    }

    Applicant {
        uuid id PK
        uuid team_id FK
        uuid job_id FK
        string name
        string email
        string phone
        string status
        timestamp applied_at
        timestamp created_at
        timestamp updated_at
    }

    Resume {
        uuid id PK
        uuid applicant_id FK
        string file_url
        string file_name
        text extracted_text
        jsonb ai_analysis
        string analysis_status
        timestamp analyzed_at
        timestamp created_at
    }

    Note {
        uuid id PK
        uuid applicant_id FK
        uuid user_id FK
        text content
        int rating
        timestamp created_at
        timestamp updated_at
    }

    Team ||--o{ TeamMember : ""
    User ||--o{ TeamMember : ""
    Team ||--o{ TeamInvitation : ""
    User ||--o{ TeamInvitation : ""
    Team ||--o{ Job : ""
    Team ||--o{ Applicant : ""
    Job ||--o{ Applicant : ""
    Applicant ||--o| Resume : ""
    Applicant ||--o{ Note : ""
    User ||--o{ Note : ""
```
