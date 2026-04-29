"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CATEGORY_LABELS, CATEGORY_EMOJIS, type ExpenseCategory } from "@/lib/validations/expense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
];

interface CategoryItem {
  category: string;
  total: string | null;
}

interface CategoryDonutChartProps {
  data: CategoryItem[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const chartData = data
    .filter((d) => parseFloat(d.total ?? "0") > 0)
    .map((d) => ({
      name:
        CATEGORY_EMOJIS[d.category as ExpenseCategory] +
        " " +
        (CATEGORY_LABELS[d.category as ExpenseCategory] || d.category),
      value: parseFloat(d.total ?? "0"),
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">By Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-xs text-muted-foreground">No data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">By Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length] ?? "hsl(var(--muted))"}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: unknown) =>
                `฿${Number(v).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              }
              contentStyle={{
                borderRadius: "8px",
                fontSize: "12px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
