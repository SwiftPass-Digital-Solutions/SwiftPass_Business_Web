import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CreditMetric {
  name: string;
  value: number;
}

interface CreditsBarChartProps {
  data: CreditMetric[];
  max?: number;
}

// Move colors outside component to prevent recreation
const COLORS: Record<string, string> = {
  Consumed: "#0C39ED",
  Purchased: "#5F7DF7",
};

const CreditsBarChart: React.FC<CreditsBarChartProps> = ({
  data,
  max = 10,
}) => {
  // Memoize chart configuration to prevent recalculation
  const chartConfig = useMemo(
    () => ({
      margin: { top: 0, right: 0, left: 0, bottom: 0 },
    }),
    [],
  );

  // Memoize domain to prevent recalculation
  const xAxisDomain = useMemo(() => [0, max] as [number, number], [max]);

  // Memoize bar cells to prevent recreation
  const barCells = useMemo(
    () =>
      data?.map((entry) => (
        <Cell key={entry.name} fill={COLORS[entry.name] ?? "#2563EB"} />
      )),
    [data],
  );

  return (
    <div className="w-full h-[200px] font-archivo">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" {...chartConfig}>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis
            type="number"
            domain={xAxisDomain}
            tickCount={max + 1}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={100}
          />

          <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={36}>
            {barCells}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(CreditsBarChart);
