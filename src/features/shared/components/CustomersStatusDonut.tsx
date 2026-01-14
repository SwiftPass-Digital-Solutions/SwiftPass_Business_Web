import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutItem extends Record<string, number | string> {
  name: string;
  value: number;
  color: string;
}

interface CustomersStatusDonutProps {
  totalLabel?: string;
  data: DonutItem[];
}

const CustomersStatusDonut: React.FC<CustomersStatusDonutProps> = ({
  totalLabel = "Customers",
  data,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full max-w-md font-archivo">
      <div className="w-full h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold">{total}</p>
          <span className="text-sm text-gray-500">{totalLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersStatusDonut;
