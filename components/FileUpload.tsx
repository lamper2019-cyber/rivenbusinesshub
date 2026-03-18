"use client";

import { useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import type { FileAttachment } from "@/lib/types";
import { putFile } from "@/lib/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ".pdf,.csv,.png,.jpg,.jpeg,.txt";

interface FileUploadProps {
  clientId: string;
  onUpload: () => void;
}

export default function FileUpload({ clientId, onUpload }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList) {
    setUploading(true);
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const isText =
        file.type === "text/plain" ||
        file.type === "text/csv" ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".txt");

      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        if (isText) {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(file);
        } else {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }
      });

      const attachment: FileAttachment = {
        id: uuid(),
        clientId,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        content: isText ? "" : content,
        textContent: isText ? content : "",
        createdAt: new Date().toISOString(),
      };

      await putFile(attachment);
    }
    setUploading(false);
    onUpload();
  }

  async function handlePaste() {
    if (!pasteText.trim()) return;
    const attachment: FileAttachment = {
      id: uuid(),
      clientId,
      fileName: `note-${new Date().toISOString().split("T")[0]}.txt`,
      fileType: "text/plain",
      fileSize: new Blob([pasteText]).size,
      content: "",
      textContent: pasteText,
      createdAt: new Date().toISOString(),
    };
    await putFile(attachment);
    setPasteText("");
    setShowPaste(false);
    onUpload();
  }

  return (
    <div className="mb-4">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragging
            ? "border-riven-gold bg-riven-gold/5"
            : "border-riven-border hover:border-riven-gold/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
          }}
        />
        <p className="text-sm text-riven-muted">
          {uploading
            ? "Uploading..."
            : "Drop files here or tap to upload (PDF, CSV, images, text — max 5MB)"}
        </p>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="text-xs text-riven-muted hover:text-white transition-colors"
        >
          {showPaste ? "Cancel" : "Paste text instead"}
        </button>
      </div>

      {showPaste && (
        <div className="mt-2 animate-fade-in">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste text content here (meeting notes, transcript, etc.)"
            rows={4}
            className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white placeholder-riven-muted focus:border-riven-gold outline-none resize-none"
          />
          <button
            onClick={handlePaste}
            className="mt-2 px-4 py-1.5 bg-riven-gold text-black text-xs font-semibold rounded-lg hover:bg-riven-gold-light transition-colors"
          >
            Save Note
          </button>
        </div>
      )}
    </div>
  );
}
