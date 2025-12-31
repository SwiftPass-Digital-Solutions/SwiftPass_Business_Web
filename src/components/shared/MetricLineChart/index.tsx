import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type StringKey<T> = Extract<keyof T, string>;

export interface Metric {
  key: string;
  name: string;
}

export interface MetricLineChartProps<
  T extends Record<string, number | string>
> {
  data: T[];
  metrics: Metric[];
  xAxisKey?: StringKey<T>;
  height?: number;
  colors?: string[];
}

export default function MetricLineChart<
  T extends Record<string, number | string>
>({
  data,
  metrics = [],
  xAxisKey = "week" as StringKey<T>,
  height = 400,
  colors = ["#8b5cf6", "#1e3a8a"],
}: MetricLineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        className="font-bricolage text-[#5A5A5A] text-xs"
        data={data}
        margin={{ top: 20, right: 30, left: -25, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: "#6b7280", fontSize: 14 }}
          axisLine={{ stroke: "#e5e7eb" }}
        />

        <YAxis
          tick={{ fill: "#6b7280", fontSize: 14 }}
          axisLine={{ stroke: "#e5e7eb" }}
          domain={[0, 100]}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
          }}
        />

        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />

        {metrics.map((metric, index) => (
          <Line
            key={String(metric.key)}
            type="linear"
            dataKey={metric.key}
            name={metric.name}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ fill: colors[index % colors.length], r: 6 }}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
