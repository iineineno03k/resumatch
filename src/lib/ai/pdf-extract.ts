/**
 * PDF テキスト抽出モジュール
 *
 * pdfjs-dist を Node.js/SSR 環境で使用するための設定:
 * - 動的インポートを使用してSSR時のDOMMatrix参照エラーを回避
 * - globalThis.pdfjsWorker に WorkerMessageHandler を設定することで
 *   動的インポートの失敗を回避
 *
 * 参考: https://github.com/mozilla/pdf.js/issues/12066
 */

// pdfjs-dist の型定義
type PDFDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
};

type PDFPageProxy = {
  getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
};

type GetDocumentParams = {
  data: Uint8Array;
  useSystemFonts?: boolean;
  disableFontFace?: boolean;
  isEvalSupported?: boolean;
};

type PDFJSLib = {
  getDocument: (params: GetDocumentParams) => {
    promise: Promise<PDFDocumentProxy>;
  };
};

let pdfjsLibInstance: PDFJSLib | null = null;

/**
 * Node.js環境用のDOMMatrixポリフィル
 * pdfjs-distが内部で使用するが、テキスト抽出には実際の変換は不要
 */
function ensureDOMMatrixPolyfill(): void {
  if (typeof globalThis.DOMMatrix === "undefined") {
    // @ts-expect-error - ポリフィル用の最小実装
    globalThis.DOMMatrix = class DOMMatrix {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      e = 0;
      f = 0;
      m11 = 1;
      m12 = 0;
      m13 = 0;
      m14 = 0;
      m21 = 0;
      m22 = 1;
      m23 = 0;
      m24 = 0;
      m31 = 0;
      m32 = 0;
      m33 = 1;
      m34 = 0;
      m41 = 0;
      m42 = 0;
      m43 = 0;
      m44 = 1;
      is2D = true;
      isIdentity = true;

      constructor(_init?: string | number[]) {
        // 初期化は無視（テキスト抽出には不要）
      }

      multiply() {
        return new DOMMatrix();
      }
      translate() {
        return new DOMMatrix();
      }
      scale() {
        return new DOMMatrix();
      }
      rotate() {
        return new DOMMatrix();
      }
      inverse() {
        return new DOMMatrix();
      }
      transformPoint(point: { x: number; y: number }) {
        return point;
      }
    };
  }
}

/**
 * pdfjs-dist を動的にロードする（SSR時のエラーを回避）
 */
async function getPdfjsLib(): Promise<PDFJSLib> {
  if (pdfjsLibInstance) {
    return pdfjsLibInstance;
  }

  // DOMMatrixポリフィルを設定
  ensureDOMMatrixPolyfill();

  // WorkerMessageHandler を globalThis に設定（動的インポートの前に必要）
  const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  // @ts-expect-error - pdfjs-dist の内部設定
  globalThis.pdfjsWorker = pdfjsWorker;

  // メインライブラリのインポート
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLibInstance = pdfjsLib as unknown as PDFJSLib;

  return pdfjsLibInstance;
}

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

    // pdfjs-dist を動的にロード
    const pdfjsLib = await getPdfjsLib();

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
        .filter((item): item is { str: string } => typeof item.str === "string")
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
