import { useCustomersQuery } from "@/services";
import { useAppSelector } from "@/store";
import { useDebounce } from "use-debounce";

interface GetCustomersFilters {
  searchParams?: string;
  page?: number;
  pageSize?: number;
}

const useCustomers = (filters: GetCustomersFilters) => {
  const { loggedIn } = useAppSelector((state) => state.auth);

  const { searchParams, ...restFilters } = filters;
  const [debouncedSearchParam] = useDebounce(searchParams, 1000);

  const cleanedFilters = Object.fromEntries(
    Object.entries(restFilters).filter(([, value]) =>
      Array.isArray(value)
        ? value.length > 0
        : value !== undefined && value !== null
    )
  );

  const queryParams: GetCustomersFilters = {
    ...cleanedFilters,
    ...(debouncedSearchParam ? { searchParams: debouncedSearchParam } : {}),
  };

  const { data, isLoading, error } = useCustomersQuery(queryParams, {
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
