"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthlyItem {
  month: number;
  total: string | null;
}

interface WeeklyItem {
  day: string;
  total: string | null;
}

interface TrendChartProps {
  monthly: MonthlyItem[];
  weekly: WeeklyItem[];
}

const tooltipStyle = {
  borderRadius: "8px",
  fontSize: "12px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
};

const formatter = (v: unknown) =>
  `฿${Number(v).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function TrendChart({ monthly, weekly }: TrendChartProps) {
  // Build full 12-month array
  const monthData = Array.from({ length: 12 }, (_, i) => {
    const found = monthly.find((m) => m.month === i + 1);
    return {
      name: MONTH_SHORT[i],
      value: parseFloat(found?.total ?? "0"),
    };
  });

  // Build last-7-days array
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const found = weekly.find((w) => w.day === key);
    return {
      name: DAY_SHORT[d.getDay()],
      value: parseFloat(found?.total ?? "0"),
    };
  });

  const barColor = "hsl(var(--chart-1))";

  return (
    <Tabs defaultValue="monthly">
      <TabsList className="w-full">
        <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
        <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
      </TabsList>

      <TabsContent value="weekly">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `฿${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  width={36}
                />
                <Tooltip formatter={formatter} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="monthly">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `฿${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  width={36}
                />
                <Tooltip formatter={formatter} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
