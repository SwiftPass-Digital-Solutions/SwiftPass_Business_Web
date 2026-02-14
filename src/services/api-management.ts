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

interface GenerateApiKeyRequest {
  environment: "Live" | "Sandbox";
}

interface GenerateApiKeyResponse {
  status: boolean;
  message: string;
  traceId: string;
  data?: {
    apiKey: string;
    environment: string;
    createdAt: string;
  };
  error?: {
    title: string;
    message: string;
  };
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
      // ✅ Add keepUnusedDataFor to cache data for 5 minutes
      keepUnusedDataFor: 300,
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
      // ✅ Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),

    revokeApiKey: builder.mutation({
      query: (body: GenerateApiKeyRequest) => ({
        url: endpoints.apiManagement.revokeApiKey,
        method: REQUEST_METHODS.POST,
        body: body,
      }),
      // ✅ Invalidate relevant tags after revoking
      invalidatesTags: ["Credits"],
      transformResponse: (response: GenerateApiKeyResponse) => response,
    }),

    generateApiKey: builder.mutation({
      query: (body: GenerateApiKeyRequest) => ({
        url: endpoints.apiManagement.generateApiKey,
        method: REQUEST_METHODS.POST,
        body: body,
      }),
      // ✅ Invalidate relevant tags after generating
      invalidatesTags: ["Credits"],
      transformResponse: (response: GenerateApiKeyResponse) => response,
    }),

    regenerateApiKey: builder.mutation({
      query: (body: GenerateApiKeyRequest) => ({
        url: endpoints.apiManagement.regenerateApiKey,
        method: REQUEST_METHODS.POST,
        body: body,
      }),
      // ✅ Invalidate relevant tags after regenerating
      invalidatesTags: ["Credits"],
      transformResponse: (response: GenerateApiKeyResponse) => response,
    }),
  }),
});

export const {
  useCustomersQuery,
  useCustomersDetailsQuery,
  useGenerateApiKeyMutation,
  useRegenerateApiKeyMutation,
  useRevokeApiKeyMutation,
} = apiManagementService;