import React from "react";

const OverviewCard = React.memo(({ card }: { card: any }) => (
  <article className="flex flex-col w-full gap-4 sm:gap-6 p-3 sm:p-4 bg-white rounded-2xl border border-[#f7f7f7] shadow-sm">
    <div className={`${card.bgColor} flex w-10 h-10 sm:w-[52px] sm:h-[52px] items-center justify-center rounded-full`}>
      <div className="text-base sm:text-xl">{card.icon}</div>
    </div>
    <div className="flex flex-col gap-0.5 sm:gap-1">
      <p className="text-xs sm:text-sm text-gray-600 [font-family:'Archivo',Helvetica]">{card.label}</p>
      <p className="text-xl sm:text-2xl font-semibold [font-family:'Archivo',Helvetica]">{card.value}</p>
    </div>
  </article>
));

OverviewCard.displayName = "OverviewCard";

export default OverviewCard;