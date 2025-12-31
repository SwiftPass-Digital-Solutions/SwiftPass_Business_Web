import React from "react";

interface StatusBadgeProps {
  value: string | number;
  variant?: string | "active" | "inactive" | "Active" | "Inactive";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  value,
  variant = "active",
}) => {
  const isActive = variant === "active" || variant === "Active";

  const badgeClasses = `inline-flex font-inter items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold ${
    isActive
      ? "text-active-badge-text bg-active-badge-bg"
      : "text-inactive-badge-text bg-inactive-badge-bg"
  }`;

  const dotClasses = `w-2 h-2 rounded-full ${
    isActive ? "bg-[#12B76A]" : "bg-[#B73912]"
  }`;

  return (
    <span className={badgeClasses}>
      <span className={dotClasses} />
      {value}
    </span>
  );
};

export { StatusBadge };
