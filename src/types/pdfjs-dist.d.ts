/**
 * pdfjs-dist モジュールの型定義補完
 */

// Worker モジュールの型定義（Node.js/SSR環境用）
declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  export const WorkerMessageHandler: {
    setup: (handler: unknown, port: unknown) => void;
  };
}
