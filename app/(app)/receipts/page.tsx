"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { ExtractionResultReceipt } from "@/components/upload/ExtractionResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";

export default function ReceiptsPage() {
  const [result, setResult] = useState<unknown>(null);

  const handleReset = () => setResult(null);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Receipt Scanner</h2>
      <p className="text-xs text-muted-foreground -mt-2">
        Upload a receipt image to auto-extract expense details with AI
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upload Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!result ? (
              <ImageUploader
                key="uploader"
                endpoint="/api/receipts/upload"
                label="receipt"
                onUploaded={(data) => setResult(data)}
              />
            ) : (
              <ExtractionResultReceipt
                key="result"
                result={result as Parameters<typeof ExtractionResultReceipt>[0]["result"]}
                onDone={handleReset}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
