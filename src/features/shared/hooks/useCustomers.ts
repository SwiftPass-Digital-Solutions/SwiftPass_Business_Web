import { useCustomersQuery } from "@/services";
import { useAppSelector } from "@/store";

interface GetCustomersFilters {
  page?: number;
  pageSize?: number;
}

const useCustomers = (params: GetCustomersFilters) => {
  const { loggedIn } = useAppSelector((state) => state.auth);

  const { data, isLoading, error } = useCustomersQuery(params, {
    refetchOnMountOrArgChange: true,
    skip: !loggedIn,
  });

  return {
    customerData: data,
    loading: isLoading,
    error,
  };
};

export default useCustomers;
