export const CheckItem = ({
  label,
  valid,
}: {
  label: string;
  valid: boolean;
}) => (
  <div className="flex items-center gap-3">
    <span
      className={`h-5 w-5 flex items-center justify-center rounded-full text-white text-xs ${
        valid ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      ✓
    </span>
    <span className={valid ? "text-black" : "text-gray-400"}>{label}</span>
  </div>
);
