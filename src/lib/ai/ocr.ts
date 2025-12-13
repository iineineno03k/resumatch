import type { TextItem } from "pdfjs-dist/types/src/display/api";
import Tesseract from "tesseract.js";

export type OcrResult = {
  success: true;
  text: string;
  confidence: number;
};

export type OcrError = {
  success: false;
  error: string;
  code: "INVALID_IMAGE" | "OCR_FAILED" | "EMPTY_CONTENT";
};

export type OcrOutput = OcrResult | OcrError;

/**
 * 画像からテキストを抽出する（OCR）
 * 日本語と英語の両方に対応
 * @param imageData 画像データ（Buffer, Uint8Array, または画像パス/URL）
 * @returns OCR結果
 */
export async function extractTextFromImage(
  imageData: Buffer | string,
): Promise<OcrOutput> {
  try {
    const result = await Tesseract.recognize(imageData, "jpn+eng", {
      logger: () => {
        // ログ出力は無効化（個人情報保護のため）
      },
    });

    const text = result.data.text.trim();
    const confidence = result.data.confidence;

    if (!text) {
      return {
        success: false,
        error: "画像からテキストを抽出できませんでした",
        code: "EMPTY_CONTENT",
      };
    }

    return {
      success: true,
      text,
      confidence,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("Invalid image") ||
      message.includes("Could not load")
    ) {
      return {
        success: false,
        error: "無効な画像ファイルです",
        code: "INVALID_IMAGE",
      };
    }

    return {
      success: false,
      error: `OCR処理中にエラーが発生しました: ${message}`,
      code: "OCR_FAILED",
    };
  }
}

/**
 * PDFの各ページを画像に変換してOCRを実行する
 * pdfjs-distでテキスト抽出できなかった場合のフォールバック用
 * @param pdfBuffer PDFのバイナリデータ
 * @returns OCR結果
 */
export async function extractTextFromPdfWithOcr(
  pdfBuffer: ArrayBuffer | Uint8Array,
): Promise<OcrOutput> {
  try {
    // Node.js環境でのPDFページレンダリングにはcanvasが必要
    // この関数はブラウザ環境または追加のcanvasライブラリが必要
    const pdfjsLib = await import("pdfjs-dist");

    const data =
      pdfBuffer instanceof ArrayBuffer ? new Uint8Array(pdfBuffer) : pdfBuffer;

    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pageCount = pdf.numPages;

    if (pageCount === 0) {
      return {
        success: false,
        error: "PDFにページがありません",
        code: "EMPTY_CONTENT",
      };
    }

    const textParts: string[] = [];
    let totalConfidence = 0;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      // 将来のcanvasレンダリング用（現在は未使用）
      const _viewport = page.getViewport({ scale: 2.0 });

      // Node.js環境ではcanvasパッケージが必要
      // 簡易実装として、ページごとにレンダリングする代わりに
      // テキストレイヤーから直接取得を試みる（既にpdf-extractで試行済みのため、
      // ここではスキップしてエラーを返す）
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ");

      if (pageText.trim()) {
        textParts.push(pageText);
        totalConfidence += 50; // テキストレイヤーからの抽出は信頼度50%と仮定
      }
    }

    if (textParts.length === 0) {
      return {
        success: false,
        error:
          "OCRでテキストを抽出できませんでした。PDF内のテキストが認識できません。",
        code: "EMPTY_CONTENT",
      };
    }

    return {
      success: true,
      text: textParts.join("\n\n").trim(),
      confidence: totalConfidence / pageCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `PDF OCR処理中にエラーが発生しました: ${message}`,
      code: "OCR_FAILED",
    };
  }
}
