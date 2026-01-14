import { DocumentStatus } from "../../dashboard/types";

type StatusBadgeProps = {
  status: DocumentStatus;
};

const STATUS_STYLES: Record<DocumentStatus, string> = {
  Approved: "bg-green-50 text-green-600",
  Pending: "bg-orange-50 text-orange-500",
  NotSubmitted: "bg-orange-50 text-orange-500",
  Rejected: "bg-red-50 text-red-500",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
