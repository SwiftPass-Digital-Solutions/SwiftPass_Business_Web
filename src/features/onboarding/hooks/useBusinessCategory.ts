import { APP_PATHS } from "@/constants";
import { useGetDocumentCategoryQuery } from "@/services";
import { useLocation } from "react-router-dom";

const useBusinessCategory = () => {
  const { pathname } = useLocation();
  const { data, isFetching, isLoading, error, isError } =
    useGetDocumentCategoryQuery(undefined, {
      refetchOnMountOrArgChange: true,
      skip: pathname !== APP_PATHS.UPLOAD_DOCS,
    });

  return {
    businessCategories: data?.data?.categories,
    loading: isFetching || isLoading,
    error,
    isError,
  };
};

export default useBusinessCategory;
