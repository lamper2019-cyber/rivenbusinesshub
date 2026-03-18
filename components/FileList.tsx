"use client";

import { useState, useEffect, useCallback } from "react";
import type { FileAttachment } from "@/lib/types";
import { getFilesForClient, deleteFile } from "@/lib/db";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIcon(fileType: string): string {
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("csv") || fileType.includes("spreadsheet")) return "📊";
  if (fileType.includes("image")) return "🖼️";
  return "📝";
}

export default function FileList({ clientId }: { clientId: string }) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [preview, setPreview] = useState<FileAttachment | null>(null);

  const load = useCallback(async () => {
    const data = await getFilesForClient(clientId);
    setFiles(data);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    await deleteFile(id);
    await load();
    if (preview?.id === id) setPreview(null);
  }

  function openPreview(file: FileAttachment) {
    if (file.textContent) {
      setPreview(file);
    } else if (file.content && file.fileType.includes("image")) {
      setPreview(file);
    } else if (file.content && file.fileType.includes("pdf")) {
      // Open PDF in new tab via blob URL
      const byteString = atob(file.content.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "application/pdf" });
      window.open(URL.createObjectURL(blob), "_blank");
    }
  }

  if (files.length === 0) {
    return (
      <p className="text-center py-4 text-riven-muted text-sm">
        No files attached yet
      </p>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between bg-riven-card border border-riven-border rounded-lg p-3 hover:border-riven-gold/30 transition-colors"
          >
            <div
              className="flex items-center gap-2 flex-1 cursor-pointer"
              onClick={() => openPreview(file)}
            >
              <span className="text-lg">{getIcon(file.fileType)}</span>
              <div>
                <p className="text-sm text-white">{file.fileName}</p>
                <p className="text-xs text-riven-muted">
                  {formatSize(file.fileSize)} ·{" "}
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(file.id)}
              className="text-xs text-riven-muted hover:text-red-400 transition-colors ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-riven-card border border-riven-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                {preview.fileName}
              </h3>
              <button
                onClick={() => setPreview(null)}
                className="text-riven-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            {preview.textContent && (
              <pre className="text-xs text-white whitespace-pre-wrap font-mono bg-riven-bg rounded-lg p-3">
                {preview.textContent}
              </pre>
            )}
            {preview.content && preview.fileType.includes("image") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.content}
                alt={preview.fileName}
                className="max-w-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
