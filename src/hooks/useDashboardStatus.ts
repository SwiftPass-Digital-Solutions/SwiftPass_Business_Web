import { useDashboardStatusQuery } from "@/services/dashboard";
import { useAppSelector } from "@/store";

const useDashboardStatus = () => {
  const { loggedIn } = useAppSelector((state) => state?.auth);

  const { data, isFetching, isLoading, refetch, currentData } =
    useDashboardStatusQuery(undefined, {
      refetchOnMountOrArgChange: true,
      skip: !loggedIn,
    });

  return {
    dashboardData: data?.data || currentData?.data,
    loading: isFetching || isLoading,
    refetchStatus: refetch,
  };
};

export default useDashboardStatus;
