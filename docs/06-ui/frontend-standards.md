# フロントエンド実装標準

このドキュメントはResuMatchのフロントエンド実装における標準ルールを定義します。
**実装時は必ずこのドキュメントを参照してください。**

---

## 1. useEffect の使用ルール

### 原則: useEffect は「外部システムとの同期」専用

useEffect は React の外部にあるシステムとコンポーネントを同期させるためのものです。
**内部の状態管理や計算には使用しません。**

### 許可される用途

```typescript
// OK: 外部APIとの接続
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort();
}, []);

// OK: ブラウザAPIとの連携（イベントリスナー）
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// OK: 外部ライブラリの初期化（チャート、マップなど）
useEffect(() => {
  const chart = new Chart(ref.current, options);
  return () => chart.destroy();
}, []);

// OK: ドキュメントタイトルの更新
useEffect(() => {
  document.title = `${pageTitle} | ResuMatch`;
}, [pageTitle]);
```

### 禁止される用途

```typescript
// NG: props/state から派生する値の計算
// useEffect で state を更新すると無駄な再レンダリングが発生
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// 正解: 直接計算する
const fullName = `${firstName} ${lastName}`;

// NG: props の変更に反応して state をリセット
useEffect(() => {
  setSelection(null);
}, [items]);

// 正解: key を使って強制リマウント、または条件分岐
<SelectList key={items.id} items={items} />

// NG: イベントハンドラで十分な処理
useEffect(() => {
  if (submitted) {
    sendAnalytics();
  }
}, [submitted]);

// 正解: イベントハンドラ内で実行
const handleSubmit = () => {
  submitForm();
  sendAnalytics();
};
```

### useEffect の代替手段

| やりたいこと | useEffect | 正しい方法 |
|-------------|-----------|-----------|
| 派生値の計算 | NG | 直接計算 or `useMemo` |
| props変更時のリセット | NG | `key` prop |
| イベント時の処理 | NG | イベントハンドラ |
| データフェッチ | 場合による | Server Components / React Query / SWR |
| フォーム状態 | NG | `useActionState` / React Hook Form |

### 参考資料

- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)

---

## 2. Server Components vs Client Components

### 原則: デフォルトは Server Components

Next.js App Router では、コンポーネントはデフォルトで Server Components です。
**Client Components (`"use client"`) は必要な場合のみ使用します。**

### Client Components が必要なケース

- `useState`, `useReducer` を使う
- `useEffect` を使う（上記ルールに従って）
- ブラウザ専用APIを使う（`window`, `localStorage`）
- イベントハンドラを使う（`onClick`, `onChange`）
- React Hooks を使うカスタムフック

### 設計パターン: Client Boundary を最小化

```typescript
// NG: ページ全体を Client Component にする
"use client";
export default function ApplicantPage() {
  const [filter, setFilter] = useState("");
  return (
    <div>
      <Header />  {/* これも Client になってしまう */}
      <FilterInput value={filter} onChange={setFilter} />
      <ApplicantList filter={filter} />
    </div>
  );
}

// OK: Client 部分だけを切り出す
// app/applicants/page.tsx (Server Component)
export default function ApplicantPage() {
  return (
    <div>
      <Header />
      <ApplicantFilter />  {/* Client Component */}
    </div>
  );
}

// components/applicant-filter.tsx
"use client";
export function ApplicantFilter() {
  const [filter, setFilter] = useState("");
  // ...
}
```

---

## 3. 状態管理

### 原則: 状態は必要最小限に

- ローカル状態: `useState`（コンポーネント内で完結）
- サーバー状態: Server Components / React Query / SWR
- URL状態: `useSearchParams`（フィルター、ページネーション）
- グローバル状態: 基本的に不要（必要なら Context）

### URL状態の活用

フィルターやページネーションは URL パラメータで管理します。

```typescript
// components/applicant-filter.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function ApplicantFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    router.push(`?${params.toString()}`);
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

## 4. データフェッチ

### 原則: Server Components でフェッチ

```typescript
// app/applicants/page.tsx
export default async function ApplicantsPage() {
  const applicants = await getApplicants();  // サーバーで実行
  return <ApplicantList applicants={applicants} />;
}
```

### Client でのフェッチが必要な場合

リアルタイム更新やユーザー操作に応じたフェッチには SWR / React Query を使用。

```typescript
"use client";

import useSWR from "swr";

export function ApplicantStatus({ id }: { id: string }) {
  const { data, mutate } = useSWR(`/api/applicants/${id}`);

  // 楽観的更新
  const handleUpdate = async (status: string) => {
    mutate({ ...data, status }, false);  // 即座にUI更新
    await updateApplicant(id, { status });
    mutate();  // サーバーと再同期
  };

  return /* ... */;
}
```

---

## 5. コンポーネント設計

### ファイル構成

```
components/
├── ui/                  # 汎用UIコンポーネント（Button, Input, etc.）
├── applicant/           # 応募者関連
│   ├── applicant-card.tsx
│   ├── applicant-list.tsx
│   └── applicant-form.tsx
├── job/                 # 求人関連
└── layout/              # レイアウト関連
```

### 命名規則

- ファイル: `kebab-case.tsx`
- コンポーネント: `PascalCase`
- props型: `ComponentNameProps`

```typescript
// components/applicant/applicant-card.tsx

type ApplicantCardProps = {
  applicant: Applicant;
  onSelect?: (id: string) => void;
};

export function ApplicantCard({ applicant, onSelect }: ApplicantCardProps) {
  // ...
}
```

### Props の設計

```typescript
// NG: 不必要に細かく分割
type Props = {
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantStatus: string;
};

// OK: オブジェクトでまとめる
type Props = {
  applicant: Applicant;
};

// NG: 内部実装を露出
type Props = {
  isLoading: boolean;
  isError: boolean;
  data: Applicant | null;
};

// OK: 呼び出し側で解決
// 親コンポーネントで loading/error を処理し、
// 子には確定したデータのみ渡す
```

---

## 6. エラーハンドリング

### Server Components

```typescript
// app/applicants/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function ApplicantPage({ params }: Props) {
  const applicant = await getApplicant(params.id);

  if (!applicant) {
    notFound();  // 404ページを表示
  }

  return <ApplicantDetail applicant={applicant} />;
}
```

### Error Boundary

```typescript
// app/applicants/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

---

## 7. アクセシビリティ

### 必須事項

- インタラクティブ要素には適切なHTML要素を使用（`<button>`, `<a>`, `<input>`）
- 画像には `alt` 属性を設定
- フォーム要素には `<label>` を関連付け
- キーボード操作に対応

```typescript
// NG: div をボタンとして使用
<div onClick={handleClick}>クリック</div>

// OK: button 要素を使用
<button type="button" onClick={handleClick}>クリック</button>

// NG: label なしの input
<input type="text" placeholder="名前" />

// OK: label を関連付け
<label htmlFor="name">名前</label>
<input id="name" type="text" />
```

---

## 8. パフォーマンス

### 不要な再レンダリングを防ぐ

```typescript
// NG: インラインでオブジェクト/関数を定義
<Component style={{ marginTop: 10 }} />
<Component onClick={() => handleClick(id)} />

// OK: メモ化または外部定義
const style = { marginTop: 10 };  // コンポーネント外

// または useCallback（本当に必要な場合のみ）
const handleClick = useCallback(() => {
  onClick(id);
}, [id, onClick]);
```

### 重い計算のメモ化

```typescript
// 重い計算は useMemo で最適化
const sortedApplicants = useMemo(() => {
  return [...applicants].sort((a, b) => /* 複雑なソート */);
}, [applicants]);
```

### 画像の最適化

```typescript
import Image from "next/image";

// next/image を使用
<Image
  src={applicant.avatarUrl}
  alt={`${applicant.name}のプロフィール画像`}
  width={40}
  height={40}
/>
```

---

## 9. テスト

### テスト対象

- ユーティリティ関数: 単体テスト必須
- カスタムフック: 単体テスト推奨
- コンポーネント: 重要なインタラクションのみ

### テストファイルの配置

```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts      # 同じディレクトリに配置
├── components/
│   └── applicant/
│       ├── applicant-card.tsx
│       └── applicant-card.test.tsx
```

---

## チェックリスト

実装時に確認してください:

- [ ] useEffect は外部システムとの同期にのみ使用しているか
- [ ] 派生値を useEffect + setState で計算していないか
- [ ] Client Components は最小限に抑えているか
- [ ] フィルター/ページネーションは URL パラメータで管理しているか
- [ ] 適切なHTML要素を使用しているか（div の乱用を避ける）
- [ ] エラーハンドリングを実装しているか
