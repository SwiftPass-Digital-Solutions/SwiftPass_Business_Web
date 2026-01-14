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

export const creditService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    dashboardAnalytics: builder.query({
      query: () => ({
        url: endpoints.credits.analytics,
        method: REQUEST_METHODS.GET,
      }),
      providesTags: ["Credits", "DashboardStatus"],
      transformResponse: (response: ResponseBody<DashboardAnalyticsResponse>) =>
        response,
    }),
  }),
});

export const { useDashboardAnalyticsQuery } = creditService;
