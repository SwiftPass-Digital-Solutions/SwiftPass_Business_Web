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

interface ApiManagementCustomersDetailsResponse {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  spsn: string;
  documents: {
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
  };
  customerId: number;
  onboardedOn: string;
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

    customersDetails: builder.query({
      query: (params) => ({
        url: endpoints.apiManagement.getCustomersDetails(params),
        method: REQUEST_METHODS.GET,
      }),
      providesTags: ["Credits", "DashboardStatus"],
      transformResponse: (
        response: ResponseBody<ApiManagementCustomersDetailsResponse>
      ) => response,
    }),
  }),
});

export const { useCustomersQuery, useCustomersDetailsQuery } =
  apiManagementService;
