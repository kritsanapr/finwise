"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Loader2Icon } from "lucide-react";

interface SlipResult {
  slip: { id: string };
  extracted: {
    bankName?: string;
    transferRef?: string;
    senderAccount?: string;
    receiverName?: string;
    transferAmount?: string;
    transferDate?: string;
  };
  publicUrl: string;
}

function SlipExtractionResult({
  result,
  onDone,
}: {
  result: SlipResult;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState(result.extracted.transferAmount ?? "");
  const [date, setDate] = useState(result.extracted.transferDate ?? "");

  const handleSaveExpense = async () => {
    if (!amount) {
      toast.error("Amount is required");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        category: "transfer",
        description: result.extracted.receiverName
          ? `Transfer to ${result.extracted.receiverName}`
          : "Bank Transfer",
        expenseDate: date || new Date().toISOString().slice(0, 10),
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save expense");
      setSaving(false);
      return;
    }

    toast.success("Expense saved from bank slip!");
    setSaving(false);
    if (onDone) {
      onDone();
    } else {
      router.push("/expenses");
      router.refresh();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">AI Extracted</Badge>
            Review Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {result.extracted.bankName && (
            <p className="text-xs text-muted-foreground">
              Bank: {result.extracted.bankName}
            </p>
          )}
          {result.extracted.receiverName && (
            <p className="text-xs text-muted-foreground">
              To: {result.extracted.receiverName}
            </p>
          )}
          {result.extracted.transferRef && (
            <p className="text-xs text-muted-foreground">
              Ref: {result.extracted.transferRef}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-amount">Amount (฿)</Label>
            <Input
              id="s-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-date">Date</Label>
            <Input
              id="s-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button onClick={handleSaveExpense} disabled={saving}>
            {saving ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <CheckIcon data-icon="inline-start" />
            )}
            Save as Expense
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SlipsPage() {
  const [result, setResult] = useState<SlipResult | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Bank Slip Scanner</h2>
      <p className="text-xs text-muted-foreground -mt-2">
        Upload a bank transfer slip to auto-extract transfer details with AI
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upload Slip</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!result ? (
              <ImageUploader
                key="uploader"
                endpoint="/api/slips/upload"
                label="bank slip"
                onUploaded={(data) => setResult(data as SlipResult)}
              />
            ) : (
              <SlipExtractionResult
                key="result"
                result={result}
                onDone={() => setResult(null)}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
