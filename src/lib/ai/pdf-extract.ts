/**
 * PDF テキスト抽出モジュール
 *
 * pdfjs-dist を Node.js/SSR 環境で使用するための設定:
 * - globalThis.pdfjsWorker に WorkerMessageHandler を設定することで
 *   動的インポートの失敗を回避
 *
 * 参考: https://github.com/mozilla/pdf.js/issues/12066
 */

// WorkerMessageHandler を globalThis に設定（動的インポートの前に必要）
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";
// @ts-expect-error - pdfjs-dist の内部設定
globalThis.pdfjsWorker = pdfjsWorker;

// メインライブラリのインポート
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

export type PdfExtractResult = {
  success: true;
  text: string;
  pageCount: number;
};

export type PdfExtractError = {
  success: false;
  error: string;
  code: "INVALID_PDF" | "EXTRACTION_FAILED" | "EMPTY_CONTENT";
};

export type PdfExtractOutput = PdfExtractResult | PdfExtractError;

/**
 * AIモックモードを使用するかどうか（実行時に評価）
 */
function isAIMockEnabled(): boolean {
  return process.env.USE_AI_MOCK === "true";
}

/**
 * PDFファイルからテキストを抽出する
 * @param pdfBuffer PDFファイルのバイナリデータ
 * @returns 抽出結果（成功時はテキスト、失敗時はエラー情報）
 */
export async function extractTextFromPdf(
  pdfBuffer: ArrayBuffer | Uint8Array,
): Promise<PdfExtractOutput> {
  // モックモードの場合はモックデータを返す
  if (isAIMockEnabled()) {
    return {
      success: true,
      text: `【モック抽出テキスト】
山田 太郎
taro.yamada@example.com
090-1234-5678

【職務経歴】
株式会社サンプル（2020年4月 - 現在）
ソフトウェアエンジニアとしてWebアプリケーション開発に従事

【スキル】
JavaScript, TypeScript, React, Node.js, Python

【学歴】
東京工業大学 情報工学部（2014年4月 - 2018年3月）

【資格】
基本情報技術者、応用情報技術者`,
      pageCount: 1,
    };
  }

  try {
    const data =
      pdfBuffer instanceof ArrayBuffer ? new Uint8Array(pdfBuffer) : pdfBuffer;

    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    if (pageCount === 0) {
      return {
        success: false,
        error: "PDFにページがありません",
        code: "EMPTY_CONTENT",
      };
    }

    const textParts: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ");

      if (pageText.trim()) {
        textParts.push(pageText);
      }
    }

    const fullText = textParts.join("\n\n").trim();

    if (!fullText) {
      return {
        success: false,
        error:
          "PDFからテキストを抽出できませんでした。画像ベースのPDFの可能性があります。",
        code: "EMPTY_CONTENT",
      };
    }

    return {
      success: true,
      text: fullText,
      pageCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("Invalid PDF")) {
      return {
        success: false,
        error: "無効なPDFファイルです",
        code: "INVALID_PDF",
      };
    }

    return {
      success: false,
      error: `PDF処理中にエラーが発生しました: ${message}`,
      code: "EXTRACTION_FAILED",
    };
  }
}

/**
 * 抽出したテキストを正規化する（余分な空白の除去など）
 */
export function normalizeExtractedText(text: string): string {
  return (
    text
      // 連続する空白を1つに
      .replace(/[ \t]+/g, " ")
      // 3つ以上の改行を2つに
      .replace(/\n{3,}/g, "\n\n")
      // 行頭・行末の空白を除去
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim()
  );
}
