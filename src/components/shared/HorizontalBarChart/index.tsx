import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type BarDatum = Record<string, string | number>;

interface Thresholds {
  high: number;
  medium: number;
}

interface Colors {
  high: string;
  medium: string;
  low: string;
}

interface HorizontalBarChartProps<T extends BarDatum> {
  data: T[];
  nameKey: Extract<keyof T, string>;
  dataKey: Extract<keyof T, string>;
  height?: number;
  showLegend?: boolean;
  thresholds?: Thresholds;
  colors?: Colors;
}

export default function HorizontalBarChart<T extends BarDatum>({
  data,
  dataKey,
  nameKey,
  height = 400,
  showLegend = true,
  thresholds = { high: 70, medium: 50 },
  colors = {
    high: "#dc2626",
    medium: "#f97316",
    low: "#e5e7eb",
  },
}: HorizontalBarChartProps<T>) {
  const getColor = (value: number) => {
    if (value >= thresholds.high) return colors.high;
    if (value >= thresholds.medium) return colors.medium;
    return colors.low;
  };

  const legendData = [
    { value: `High (${thresholds.high}+)`, color: colors.high },
    {
      value: `Medium (${thresholds.medium}-${thresholds.high - 1})`,
      color: colors.medium,
    },
    { value: `Low (<${thresholds.medium})`, color: colors.low },
  ];

  const CustomLegend = () => (
    <div className="flex justify-center gap-8 mt-6">
      {legendData.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-700">{item.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 25, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{ fill: "#6b7280", fontSize: 14 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />

          <YAxis
            type="category"
            dataKey={nameKey}
            tick={{ fill: "#4b5563", fontSize: 14 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          />

          <Bar dataKey={dataKey} radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(entry[dataKey] as number)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {showLegend && <CustomLegend />}
    </div>
  );
}
