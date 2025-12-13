# コードスタイル・規約

## Biome 設定
- インデント: スペース 2
- import 自動整理: 有効
- Next.js / React recommended ルール適用

## 命名規則
- **ファイル**: `kebab-case.ts`
- **コンポーネント**: `PascalCase.tsx`
- **関数/変数**: `camelCase`
- **定数**: `UPPER_SNAKE_CASE`
- **型/Interface**: `PascalCase`

## フロントエンド実装標準 (重要)
詳細は `docs/06-ui/frontend-standards.md` 参照

### 必須ルール
1. **データフェッチは Server Components で行う** - Client でのフェッチは原則禁止
2. **useEffect は外部システムとの同期専用** - 派生値計算や内部状態管理には使用禁止
3. **Client Components は必要最小限に** - `"use client"` の影響範囲を理解する
4. **データ操作は Server Actions で行う** - revalidate との連携を活用

## 個人情報の取り扱い (絶対厳守)

### 禁止事項
- ログに個人情報を出力しない
- console.log でユーザーデータをそのまま出力しない
- エラーログに個人情報を含めない

### OK 例
```typescript
console.log(`Applicant created: id=${applicant.id}`);
console.error(`Failed to process resume: applicantId=${applicantId}`);
```

### NG 例
```typescript
// 絶対にやらない
console.log(`Applicant: ${applicant.name}, ${applicant.email}`);
console.log(`Resume text: ${resume.extractedText}`);
```

## アクセス制御
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

## UI開発フロー
1. コンポーネント/画面を作成
2. Storybook で確認可能な状態にする
3. ユーザーにレビュー依頼
4. OK が出たら次のタスクへ

## その他
- **絵文字は使用しない**（ユーザーから明示的に要求された場合を除く）
