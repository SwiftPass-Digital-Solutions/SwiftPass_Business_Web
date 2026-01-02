import { endpoints, REQUEST_METHODS } from "@/constants";
import { apiSlice } from "@/store";
import { ResponseBody } from "@/types";

type BusinessType = {
  typeId: number;
  typeName: string;
  typeDisplayName: string;
};

interface BusinessTypesData {
  businessTypes: BusinessType[];
}

interface InitiateData {
  trackingId: string;
}

interface VerifyOtpData {
  token: string;
}

export const onboardingService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiate: builder.mutation({
      query: (values) => ({
        url: endpoints.identity.initiate,
        method: REQUEST_METHODS.POST,
        body: values,
      }),
      transformResponse: (response: ResponseBody<InitiateData>) => response,
    }),
    businessTypes: builder.query({
      query: () => ({
        url: endpoints.identity.businessTypes,
        method: REQUEST_METHODS.GET,
      }),
      keepUnusedDataFor: 0,
      transformResponse: (response: ResponseBody<BusinessTypesData>) =>
        response,
    }),
    verifyOtp: builder.mutation({
      query: (values) => ({
        url: endpoints.identity.verifyOtp,
        method: REQUEST_METHODS.POST,
        body: values,
      }),
      transformResponse: (response: ResponseBody<VerifyOtpData>) => response,
    }),
    resendOtp: builder.mutation({
      query: (values) => ({
        url: endpoints.identity.resendOtp(values.email),
        method: REQUEST_METHODS.POST,
      }),
      transformResponse: (response: ResponseBody<InitiateData>) => response,
    }),
  }),
});

export const {
  useInitiateMutation,
  useBusinessTypesQuery,
  useVerifyOtpMutation,
  useResendOtpMutation,
} = onboardingService;
