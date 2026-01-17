import { useMemo, useState } from "react";
import { useNotifications } from "../hooks";
import NotificationRow from "./NotificationsRow";
import { PageLoader } from "@/components";
import { useReadNotificationMutation } from "@/services";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils";

const Notifications = () => {
  const [pagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const [triggerReadNotification] = useReadNotificationMutation();

  const { notificationsData, loading } = useNotifications({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const allNotifications = useMemo(
    () => notificationsData?.data || [],
    [notificationsData]
  );

  const handleRead = async (id: number) => {
    try {
      const response = await triggerReadNotification({ id: id }).unwrap();
      if (!response?.data)
        return toast.error(response?.message || "Something went wrong");
    } catch (error) {
      const message = getErrorMessage(error);
      return toast.error(message || "Something went wrong");
    }
  };

  return (
    <>
      {loading && <PageLoader />}
      <div className="font-archivo space-y-5">
        <div className="p-4 rounded-3xl border border-[#F0F0F0] space-y-3">
          {allNotifications?.map((notifications) => (
            <NotificationRow
              key={notifications?.id}
              {...notifications}
              onRead={() => handleRead(notifications?.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Notifications;
