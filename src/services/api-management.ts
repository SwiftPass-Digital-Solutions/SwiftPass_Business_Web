import { endpoints, REQUEST_METHODS } from "@/constants";
import { Customers } from "@/features/dashboard/types";
import { apiSlice } from "@/store";
import { ResponseBody } from "@/types";

interface ApiManagementCustomersResponse {
  data: Customers[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export const apiManagementService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    customers: builder.query({
      query: (params) => ({
        url: endpoints.apiManagement.getCustomers,
        method: REQUEST_METHODS.GET,
        params: params,
      }),
      providesTags: ["Credits", "DashboardStatus"],
      transformResponse: (
        response: ResponseBody<ApiManagementCustomersResponse>
      ) => response,
    }),
  }),
});

export const { useCustomersQuery } = apiManagementService;
