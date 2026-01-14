import { useDashboardAnalyticsQuery } from "@/services";
import { useAppSelector } from "@/store";

const useDashboardAnalytics = () => {
  const { loggedIn } = useAppSelector((state) => state.auth);

  const { data, isLoading, error } = useDashboardAnalyticsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !loggedIn,
  });

  return {
    dashboardAnalytics: data,
    loading: isLoading,
    error,
  };
};

export default useDashboardAnalytics;
