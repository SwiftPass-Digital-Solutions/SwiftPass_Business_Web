import { endpoints, REQUEST_METHODS } from "@/constants";
import { apiSlice } from "@/store";
import { ResponseBody } from "@/types";

interface DashboardAnalyticsResponse {
  creditBalance: number;
  totalCustomersOnboarded: number;
  totalApiCalls: number;
  totalCreditsPurchased: number;
  totalCreditsConsumed: number;
}

interface CreditsAnalyticsResponse {
  callsToday: number;
  callsThisMonth: number;
  avgCallsPerHr: number;
  failureRate: number;
  creditBalance: number;
  creditsUsedThisMonth: number;
  creditsPurchased: number;
  creditsConsumed: number;
  recentCreditHistory: Array<{
    id: number;
    credits: number;
    amount: number;
    balanceAfter: number;
    transactionType: "Buy" | string;
    description: string;
    createdAt: string;
  }>;
}

export const creditService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    dashboardAnalytics: builder.query({
      query: () => ({
        url: endpoints.credits.analytics,
        method: REQUEST_METHODS.GET,
      }),
      providesTags: [ "DashboardStatus","Credits"],
      transformResponse: (response: ResponseBody<DashboardAnalyticsResponse>) =>
        response,
    }),
    creditsAnalytics: builder.query({
      query: () => ({
        url: endpoints.credits.creditanalytics,
        method: REQUEST_METHODS.GET,
      }),
      providesTags: [],
      transformResponse: (response: ResponseBody<CreditsAnalyticsResponse>) =>
        response,
    }),
    getCreditPackages: builder.query({
      query: () => ({
        url: endpoints.credits.packages,
        method: REQUEST_METHODS.GET,
      }),
      providesTags: [],
      transformResponse: (response: ResponseBody<Array<{ id: number; name: string; credits: number; amount: number }>>) => response,
    }),
    createCustomPackage: builder.mutation({
      query: (body: { id: number; name: string; credits: number; amount: number }) => ({
        url: endpoints.credits.customPackage,
        method: REQUEST_METHODS.POST,
        body,
      }),
      invalidatesTags: [],
      transformResponse: (response: ResponseBody<{ id: number; name: string; credits: number; amount: number }>) => response,
    }),
    buyCredits: builder.mutation({
      query: (body: { packageId: number; customAmount: number }) => ({
        url: endpoints.credits.buy,
        method: REQUEST_METHODS.POST,
        body,
      }),
      invalidatesTags: [],
      transformResponse: (response: ResponseBody<boolean>) => response,
    }),
  }),
});

export const { useDashboardAnalyticsQuery, useCreditsAnalyticsQuery, useGetCreditPackagesQuery, useCreateCustomPackageMutation, useBuyCreditsMutation } = creditService;
