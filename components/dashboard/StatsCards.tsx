"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  periodTotal: string;
  transactionCount: number;
  weeklyTotal?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 700;
    const step = 16;
    const steps = duration / step;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setDisplay(current);
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      ฿{display.toLocaleString("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
    </span>
  );
}

const cards = [
  { key: "month", label: "This Month" },
  { key: "week", label: "This Week" },
  { key: "count", label: "Transactions" },
];

export function StatsCards({
  periodTotal,
  transactionCount,
  weeklyTotal = "0",
}: StatsCardsProps) {
  const stats = [
    {
      label: "This Month",
      value: parseFloat(periodTotal || "0"),
      isCount: false,
    },
    {
      label: "This Week",
      value: parseFloat(weeklyTotal || "0"),
      isCount: false,
    },
    { label: "Transactions", value: transactionCount, isCount: true },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <Card>
            <CardContent className="flex flex-col gap-1 p-3">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </span>
              <span className="text-sm font-bold leading-none">
                {stat.isCount ? (
                  stat.value
                ) : (
                  <AnimatedNumber value={stat.value} />
                )}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
