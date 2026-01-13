import React from "react";

interface ProgressBarProps {
  value: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label = "Progress",
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full rounded-2xl bg-[#FCFCFC] p-3 font-archivo">
      <p className="text-sm font-normal text-black mb-2.5">
        {clampedValue}% {label}
      </p>

      <div className="w-full h-1 bg-[#F7F7F7] rounded-full overflow-hidden">
        <div
          className="h-1 bg-[#00A922] rounded-xl transition-all duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
