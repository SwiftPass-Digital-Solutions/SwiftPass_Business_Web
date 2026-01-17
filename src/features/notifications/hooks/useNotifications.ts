import { useNotificationsQuery } from "@/services";
import { useAppSelector } from "@/store";

interface NotificationsProps {
  page: number;
  pageSize: number;
}

const useNotifications = (filters: NotificationsProps) => {
  const { loggedIn } = useAppSelector((state) => state.auth);

  const { data, currentData, isLoading, error } = useNotificationsQuery(
    filters,
    {
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      skip: !loggedIn,
    }
  );

  return {
    notificationsData: currentData?.data || data?.data,
    loading: isLoading,
    error,
  };
};

export default useNotifications;
