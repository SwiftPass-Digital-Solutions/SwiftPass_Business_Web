import { useDashboardAnalyticsQuery, useCreditsAnalyticsQuery } from "@/services";
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

const useCreditsAnalytics = () => {
  const { loggedIn } = useAppSelector((state) => state.auth);

  const { data, isLoading, error } = useCreditsAnalyticsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !loggedIn,
  });

  return {
    creditsAnalytics: data,
    loading: isLoading,
    error,
  };
};

export default useDashboardAnalytics;
export { useCreditsAnalytics };
