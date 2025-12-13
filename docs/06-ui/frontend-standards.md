# フロントエンド実装標準

このドキュメントはResuMatchのフロントエンド実装における標準ルールを定義します。
**実装時は必ずこのドキュメントを参照してください。**

---

## 基本方針

本プロジェクトのフロントエンド実装は、以下の資料を正とします:

**[Next.js App Router 設計入門](./nextjs-basic-principle/intro.md)**

実装時に迷った場合は、該当する章を参照してください。

---

## 章別インデックス

### 実装シーン別の参照先

| 実装しようとしていること | 参照すべき章 |
|------------------------|-------------|
| データを取得したい | [データフェッチ on Server Components](./nextjs-basic-principle/part_1_server_components.md) |
| 複数のデータを同時に取得したい | [並行データフェッチ](./nextjs-basic-principle/part_1_concurrent_fetch.md) |
| データ取得ロジックを共通化したい | [データローダー](./nextjs-basic-principle/part_1_data_loader.md) |
| API設計をどうするか迷っている | [細粒度なAPI設計](./nextjs-basic-principle/part_1_fine_grained_api_design.md) |
| ユーザー操作に応じてデータを取得したい | [ユーザー操作とデータフェッチ](./nextjs-basic-principle/part_1_interactive_fetch.md) |
| 同じデータを複数箇所で使いたい | [Request Memoization](./nextjs-basic-principle/part_1_request_memoization.md) |
| コンポーネントの配置場所に迷っている | [コロケーション](./nextjs-basic-principle/part_1_colocation.md) |
| Client/Serverの使い分けに迷っている | [Client Componentsのユースケース](./nextjs-basic-principle/part_2_client_components_usecase.md) |
| `"use client"`の影響範囲を知りたい | [クライアントとサーバーのバンドル境界](./nextjs-basic-principle/part_2_bundle_boundary.md) |
| Server内でClientを使いたい | [Compositionパターン](./nextjs-basic-principle/part_2_composition_pattern.md) |
| コンポーネント設計の方針を知りたい | [Container/Presentationalパターン](./nextjs-basic-principle/part_2_container_presentational_pattern.md) |
| ページ/レイアウトの設計方針 | [UIをツリーに分解する](./nextjs-basic-principle/part_2_container_1st_design.md) |
| データを更新・作成・削除したい | [データ操作とServer Actions](./nextjs-basic-principle/part_3_data_mutation.md) |
| 静的生成とキャッシュを理解したい | [Static RenderingとFull Route Cache](./nextjs-basic-principle/part_3_static_rendering_full_route_cache.md) |
| 動的レンダリングを理解したい | [Dynamic RenderingとData Cache](./nextjs-basic-principle/part_3_dynamic_rendering_data_cache.md) |
| `dynamicIO`フラグについて | [dynamicIO](./nextjs-basic-principle/part_3_dynamicio.md) |
| Router Cacheを理解したい | [Router Cache](./nextjs-basic-principle/part_3_router_cache.md) |
| Suspenseとストリーミングを使いたい | [SuspenseとStreaming SSR](./nextjs-basic-principle/part_4_suspense_and_streaming.md) |
| PPRを理解したい | [Partial Pre-Rendering](./nextjs-basic-principle/part_4_partial_pre_rendering.md) |
| Server Componentsの純粋性 | [Server Componentsの純粋性](./nextjs-basic-principle/part_4_pure_server_components.md) |
| 認証・認可を実装したい | [認証と認可](./nextjs-basic-principle/part_5_auth.md) |
| エラーハンドリングを実装したい | [エラーハンドリング](./nextjs-basic-principle/part_5_error_handling.md) |
| リクエスト情報を参照したい | [リクエスト参照](./nextjs-basic-principle/part_5_request_ref.md) |

---

## 必須ルール

### 1. データフェッチは Server Components で行う

**参照: [データフェッチ on Server Components](./nextjs-basic-principle/part_1_server_components.md)**

```typescript
// OK: Server Components でデータフェッチ
export async function ApplicantList({ teamId }: { teamId: string }) {
  const applicants = await getApplicants(teamId);
  return <ApplicantListPresentation applicants={applicants} />;
}

// NG: Client Components でデータフェッチ
"use client";
export function ApplicantList({ teamId }: { teamId: string }) {
  const [applicants, setApplicants] = useState([]);
  useEffect(() => {
    fetch(`/api/applicants?teamId=${teamId}`)
      .then(res => res.json())
      .then(setApplicants);
  }, [teamId]);
  // ...
}
```

### 2. useEffect は外部システムとの同期専用

**useEffect は React の外部にあるシステムとの同期にのみ使用します。**

#### 許可される用途

- 外部APIとの接続（WebSocket、EventSourceなど）
- ブラウザAPIとの連携（イベントリスナー、ResizeObserver）
- 外部ライブラリの初期化（チャート、マップなど）
- ドキュメントタイトルの更新

#### 禁止される用途

```typescript
// NG: 派生値の計算
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
// OK: 直接計算
const fullName = `${firstName} ${lastName}`;

// NG: props変更時のリセット
useEffect(() => {
  setSelection(null);
}, [items]);
// OK: key を使う
<SelectList key={items.id} items={items} />

// NG: データフェッチ（Client Components内）
useEffect(() => {
  fetchData().then(setData);
}, []);
// OK: Server Components でフェッチ、または useActionState
```

**参考: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)**

### 3. Client Components は必要最小限に

**参照: [Client Componentsのユースケース](./nextjs-basic-principle/part_2_client_components_usecase.md)**

Client Components（`"use client"`）が必要なケース:
- イベントハンドラ（`onClick`, `onChange`）
- 状態hooks（`useState`, `useReducer`）
- ライフサイクルhooks（`useEffect`）
- ブラウザAPI

```typescript
// NG: ページ全体を Client Component にする
"use client";
export default function ApplicantPage() { /* ... */ }

// OK: Client 部分のみを切り出す
// page.tsx (Server Component)
export default async function ApplicantPage() {
  const applicants = await getApplicants();
  return (
    <div>
      <ApplicantFilter />  {/* Client Component */}
      <ApplicantList applicants={applicants} />  {/* Server Component */}
    </div>
  );
}
```

### 4. Container/Presentational パターンを採用する

**参照: [Container/Presentationalパターン](./nextjs-basic-principle/part_2_container_presentational_pattern.md)**

- **Container Components**: データフェッチを担当（Server Components）
- **Presentational Components**: 表示を担当（Shared/Client Components）

```typescript
// Container: データ取得
export async function ApplicantCardContainer({ id }: { id: string }) {
  const applicant = await getApplicant(id);
  return <ApplicantCardPresentation applicant={applicant} />;
}

// Presentational: 表示のみ（テスト容易）
export function ApplicantCardPresentation({ applicant }: { applicant: Applicant }) {
  return (
    <div>
      <h2>{applicant.name}</h2>
      {/* ... */}
    </div>
  );
}
```

### 5. データ操作は Server Actions で行う

**参照: [データ操作とServer Actions](./nextjs-basic-principle/part_3_data_mutation.md)**

```typescript
// actions.ts
"use server";

import { revalidateTag } from "next/cache";

export async function createApplicant(formData: FormData) {
  // データ作成処理
  await db.applicants.create({ /* ... */ });

  // キャッシュの再検証
  revalidateTag("applicants");
}
```

```typescript
// form.tsx
"use client";

import { createApplicant } from "./actions";

export function ApplicantForm() {
  return (
    <form action={createApplicant}>
      {/* ... */}
      <button type="submit">作成</button>
    </form>
  );
}
```

### 6. フィルター/検索はURL状態を活用する

**参照: [ユーザー操作とデータフェッチ](./nextjs-basic-principle/part_1_interactive_fetch.md)**

リロード復元やURLシェアが必要な場合:

```typescript
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function ApplicantFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    router.replace(`?${params.toString()}`);
  };

  return (
    <Select
      value={searchParams.get("status") || "all"}
      onChange={handleStatusChange}
    />
  );
}
```

---

## ディレクトリ構成

**参照: [Container/Presentationalパターン](./nextjs-basic-principle/part_2_container_presentational_pattern.md#container単位のディレクトリ構成例)**

```
app/
├── (auth)/
│   └── applicants/
│       ├── page.tsx
│       ├── layout.tsx
│       └── _containers/
│           ├── applicant-list/
│           │   ├── index.tsx          # Container を re-export
│           │   ├── container.tsx      # データ取得
│           │   └── presentation.tsx   # 表示
│           └── applicant-filter/
│               └── ...
└── api/
    └── ...
```

---

## チェックリスト

実装前に確認:

- [ ] データフェッチは Server Components で行っているか
- [ ] useEffect を派生値計算や内部状態管理に使っていないか
- [ ] Client Components は必要最小限になっているか
- [ ] Container/Presentational パターンで分離しているか
- [ ] データ操作は Server Actions を使っているか
- [ ] フィルターなどの状態はURL管理を検討したか
