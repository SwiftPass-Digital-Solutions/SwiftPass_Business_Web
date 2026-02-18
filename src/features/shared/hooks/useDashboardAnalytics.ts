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

  const { data, isLoading, error, refetch } = useCreditsAnalyticsQuery(
    undefined,
    {
      // avoid refetching on every mount (prevents blocking UI when component remounts)
      refetchOnMountOrArgChange: true,
      // keep skipping when user is not logged in
      skip: !loggedIn,
    },
  );

  return {
    creditsAnalytics: data,
    loading: isLoading,
    error,
    refetch,
  };
};

export default useDashboardAnalytics;
export { useCreditsAnalytics };
