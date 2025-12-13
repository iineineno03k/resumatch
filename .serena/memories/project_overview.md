# ResuMatch - プロジェクト概要

## サービス名
ResuMatch（レジュマッチ）

## 目的
- 採用管理SaaS + AI履歴書解析
- ポートフォリオとして受託案件獲得に活用

## 主要機能
- チーム管理（マルチテナント）
- 求人管理
- 応募者管理
- 履歴書のPDF解析（AI: Google Gemini）
- メモ・評価機能
- 招待リンクによるチームメンバー追加

## 重要な制約
- **個人情報の取り扱い**: ログに個人情報を出力しない（氏名、メール、電話番号、履歴書内容）
- **アクセス制御**: 全APIでチーム所属チェック（team_id フィルタリング必須）
- **認証**: Clerk を使用、認証なしでアクセス可能なAPIは Webhook のみ

## ドキュメント
設計ドキュメントは `docs/` 配下:
- `docs/00-tasks/implementation-tasks.md` - 実装タスク一覧
- `docs/01-requirements/` - 要件定義
- `docs/02-architecture/` - 技術設計
- `docs/03-database/` - DB設計
- `docs/04-api/` - API設計
- `docs/05-ai-module/` - AI処理仕様
- `docs/06-ui/` - 画面設計
- `docs/06-ui/frontend-standards.md` - フロントエンド実装標準
