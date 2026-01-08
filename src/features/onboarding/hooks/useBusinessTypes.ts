import { useBusinessTypesQuery } from "@/services";
import { useLocation } from "react-router-dom";

const useBusinessTypes = () => {
  const { pathname } = useLocation();

  const { data, isLoading, error, refetch, isError } =
    useBusinessTypesQuery(undefined, {
      refetchOnMountOrArgChange: true,
      skip: pathname !== "/onboarding/registration",
    });

  return {
    businessTypes: data?.data?.businessTypes,
    loading: isLoading,
    error,
    refetch,
    isError,
  };
};

export default useBusinessTypes;
