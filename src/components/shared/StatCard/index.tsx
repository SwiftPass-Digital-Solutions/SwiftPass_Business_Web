import { FC, ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
};

const StatCard: FC<StatCardProps> = ({ title, value, icon, subtitle }) => {
  return (
    <div
      className="w-full bg-white rounded-2xl border border-[#F7F7F7] p-3 flex flex-col gap-6"
      style={{
        boxShadow: "0px 2px 12px 0px rgba(213, 213, 213, 0.2)",
      }}
    >
      {icon && <div className="">{icon}</div>}

      <div className="space-y-1">
        <p className="text-[#9F9F9F] text-sm font-normal">{title}</p>
        <p className="text-[#050505] text-2xl font-semibold">{value}</p>
        {subtitle && <p className="text-sm text-[#737373]">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
