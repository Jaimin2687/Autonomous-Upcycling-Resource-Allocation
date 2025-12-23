"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ThroughputChartProps {
  data: { month: string; tons: number; revenue: number }[];
}

export default function ThroughputChart({ data }: ThroughputChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="tonsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f9e4f" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#1f9e4f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
            }}
          />
          <Area type="monotone" dataKey="tons" stroke="#1f9e4f" fill="url(#tonsGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="revenue" stroke="#0284c7" fillOpacity={0} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
