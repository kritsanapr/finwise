"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Loader2Icon } from "lucide-react";

interface ReceiptExtractionResult {
  receipt: { id: string };
  extracted: {
    merchant?: string;
    date?: string;
    amount?: string;
    items?: string[];
  };
  publicUrl: string;
}

interface ExtractionResultReceiptProps {
  result: ReceiptExtractionResult;
  onDone?: () => void;
}

export function ExtractionResultReceipt({
  result,
  onDone,
}: ExtractionResultReceiptProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState(result.extracted.amount ?? "");
  const [merchant, setMerchant] = useState(result.extracted.merchant ?? "");
  const [date, setDate] = useState(result.extracted.date ?? "");

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
        category: "other",
        description: merchant || "Receipt",
        expenseDate: date || new Date().toISOString().slice(0, 10),
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save expense");
      setSaving(false);
      return;
    }

    toast.success("Expense saved from receipt!");
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
            Review & Save
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-merchant">Merchant</Label>
            <Input
              id="r-merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Merchant name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-amount">Amount (฿)</Label>
            <Input
              id="r-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-date">Date</Label>
            <Input
              id="r-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {result.extracted.items && result.extracted.items.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Items</Label>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                {result.extracted.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

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
