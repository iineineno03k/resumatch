"use client";

import { AlertCircle, File, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // bytes
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = ".pdf",
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (
        accept &&
        !file.name.toLowerCase().endsWith(accept.replace(".", ""))
      ) {
        return `${accept} ファイルのみアップロード可能です`;
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024);
        return `ファイルサイズは ${maxSizeMB}MB 以下にしてください`;
      }

      return null;
    },
    [accept, maxSize],
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  if (selectedFile) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-muted/50 p-4",
          className,
        )}
      >
        <File className="h-8 w-8 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={disabled}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">削除</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <section
        aria-label="ファイルドロップエリア"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragOver && !disabled
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <Upload
          className={cn(
            "h-10 w-10 mb-4",
            isDragOver ? "text-primary" : "text-muted-foreground",
          )}
        />
        <p className="text-sm text-center text-muted-foreground mb-2">
          ここにファイルをドラッグ&ドロップ
        </p>
        <p className="text-xs text-muted-foreground mb-4">または</p>
        <label>
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="sr-only"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            asChild
          >
            <span>ファイルを選択</span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-4">
          {accept} ファイル（最大 {Math.round(maxSize / 1024 / 1024)}MB）
        </p>
      </section>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
