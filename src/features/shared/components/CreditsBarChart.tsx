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

const COLORS: Record<string, string> = {
  Consumed: "#0C39ED",
  Purchased: "#5F7DF7",
};

const CreditsBarChart: React.FC<CreditsBarChartProps> = ({
  data,
  max = 10,
}) => {
  return (
    <div className="w-full h-[200px] font-archivo">
    
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis
            type="number"
            domain={[0, max]}
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

          <Bar
            dataKey="value"
            radius={[0, 12, 12, 0]}
            barSize={36}
          >
            {data?.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] ?? "#2563EB"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CreditsBarChart;
