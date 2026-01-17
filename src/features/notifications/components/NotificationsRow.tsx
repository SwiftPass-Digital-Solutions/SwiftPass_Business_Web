import { Notifications } from "@/types";
import { dayJs } from "@/utils";
import React from "react";

interface NotificationRowProps extends Notifications {
  onRead?: () => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  message,
  createdAt,
  isRead,
  source,
  onRead,
}) => {
  return (
    <div
      onClick={onRead}
      className={`flex cursor-pointer font-archivo items-center justify-between p-2 rounded-lg  transition-colors `}
    >
      <div className="flex flex-col gap-1">
        <p className="text-base text-[#030303] font-medium">{message}</p>
        {source && (
          <span className="text-xs text-[#A1A1A1]">
            {dayJs(createdAt).fromNow()} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {source}
          </span>
        )}
      </div>
      {!isRead && (
        <span className="w-3 h-3 bg-[#0C39ED] rounded-full shrink-0" />
      )}
    </div>
  );
};

export default NotificationRow;
