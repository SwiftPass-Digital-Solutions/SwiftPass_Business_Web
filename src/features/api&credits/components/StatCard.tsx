import React from "react";

const StatCard = React.memo(({ card }: { card: any }) => (
  <article className="flex flex-col items-start gap-6 p-3 bg-white rounded-2xl border border-[#f7f7f7] shadow-sm">
    <div className={`flex w-[52px] h-[52px] items-center justify-center ${card.bgColor} rounded-full`}>
      <div className="text-xl">{card.icon}</div>
    </div>
    <div className="flex flex-col gap-1 w-full">
      <p className="text-sm text-gray-600">{card.label}</p>
      <p className="text-2xl font-semibold">{card.value}</p>
    </div>
  </article>
));

export default StatCard;
