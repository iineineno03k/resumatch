// Node.js環境用のlegacyビルドを使用
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Node.js環境でのワーカー設定は不要（getDocumentでisEvalSupported: falseを指定）

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
 * PDFファイルからテキストを抽出する
 * @param pdfBuffer PDFファイルのバイナリデータ
 * @returns 抽出結果（成功時はテキスト、失敗時はエラー情報）
 */
export async function extractTextFromPdf(
  pdfBuffer: ArrayBuffer | Uint8Array,
): Promise<PdfExtractOutput> {
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
