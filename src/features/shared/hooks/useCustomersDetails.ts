import { useCustomersDetailsQuery } from "@/services";
import { useAppSelector } from "@/store";

const useCustomersDetails = (customerId: number | null) => {
  const { loggedIn } = useAppSelector((state) => state.auth);

  const {
    data: customerDetails,
    isLoading,
    isFetching,
    error,
  } = useCustomersDetailsQuery(customerId, {
    refetchOnMountOrArgChange: true,
    skip: !loggedIn || !customerId,
  });

  return {
    customerDetails,
    loading: isLoading || isFetching,
    error,
  };
};

export default useCustomersDetails;
