# ResuMatch 設計ドキュメント

採用管理SaaS + AI履歴書解析

## ドキュメント一覧

| カテゴリ | ドキュメント | 概要 |
|----------|-------------|------|
| タスク | [implementation-tasks.md](./00-tasks/implementation-tasks.md) | 実装タスク一覧（引き継ぎ用） |
| 要件 | [overview.md](./01-requirements/overview.md) | プロジェクト背景・目的・スコープ |
| 設計 | [tech-stack.md](./02-architecture/tech-stack.md) | 技術スタック |
| DB | [er-diagram.md](./03-database/er-diagram.md) | ER図（Mermaid） |
| DB | [tables.md](./03-database/tables.md) | テーブル定義SQL |
| API | [endpoints.md](./04-api/endpoints.md) | APIエンドポイント一覧 |
| API | [openapi.yaml](./04-api/openapi.yaml) | OpenAPI仕様書（未作成） |
| AI | [pdf-extraction.md](./05-ai-module/pdf-extraction.md) | PDF解析の実装方針（未作成） |
| UI | [screens.md](./06-ui/screens.md) | 画面一覧・ワイヤーフレーム |
| UI | [frontend-standards.md](./06-ui/frontend-standards.md) | **フロントエンド実装標準（必読）** |
| UI | [nextjs-basic-principle/](./06-ui/nextjs-basic-principle/) | Next.js App Router 設計入門（実装の正） |

## プロジェクト概要

- **サービス名**: ResuMatch（レジュマッチ）
- **目的**: 受託案件獲得のためのポートフォリオ
- **プロダクト**: 採用管理システム（ATS）+ AI履歴書解析

## ステータス

- [x] 要件定義
- [x] 技術選定
- [x] DB設計
- [x] API設計
- [x] 画面設計
- [ ] 実装
- [ ] デプロイ

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-01-XX | 初版作成：要件定義、技術選定、DB設計 |
