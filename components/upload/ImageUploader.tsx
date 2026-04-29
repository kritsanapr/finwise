"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloudIcon, CameraIcon, XIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUploaded: (result: unknown) => void;
  endpoint: "/api/receipts/upload" | "/api/slips/upload";
  label?: string;
}

export function ImageUploader({
  onUploaded,
  endpoint,
  label = "Receipt",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(30);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(60);
      const res = await fetch(endpoint, { method: "POST", body: formData });
      setProgress(90);
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProgress(100);
      onUploaded(data);
    } catch {
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={300}
              className="h-48 w-full object-contain bg-muted"
            />
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur"
            >
              <XIcon className="size-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
              dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloudIcon className="size-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop {label} here</p>
              <p className="text-xs text-muted-foreground">or tap to browse</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* Actions */}
      <div className="flex gap-2">
        {!preview && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => cameraInputRef.current?.click()}
          >
            <CameraIcon data-icon="inline-start" />
            Camera
          </Button>
        )}
        {preview && (
          <Button
            type="button"
            className="flex-1"
            disabled={uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <UploadCloudIcon data-icon="inline-start" />
            )}
            {uploading ? "Uploading..." : "Extract with AI"}
          </Button>
        )}
      </div>

      {uploading && <Progress value={progress} className="h-1" />}
    </div>
  );
}
