import { endpoints, REQUEST_METHODS } from "@/constants";
import { apiSlice } from "@/store";
import { ResponseBody } from "@/types";

interface LoginData {
  email: string;
  firstName: string | null;
  lastName: string;
  businessName: string;
  userType: "Business" | "Individual";
  hasSetUpSecurityQuestions: boolean;
  hasCompletedProfileSetup: boolean;
  token: string;
}

interface ForgotPasswordData {
  trackingId: string;
}

interface VerifyOtpData {
  token: string;
}

export const authService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (values) => ({
        url: endpoints.auth.login,
        method: REQUEST_METHODS.POST,
        body: values,
      }),
      invalidatesTags: ["DashboardStatus", "Notifications"],
      transformResponse: (response: ResponseBody<LoginData>) => response,
    }),
    forgotPassword: builder.mutation({
      query: (values) => ({
        url: endpoints.auth.forgotPassword(values.email),
        method: REQUEST_METHODS.POST,
      }),
      transformResponse: (response: ResponseBody<ForgotPasswordData>) =>
        response,
    }),
    verifyForgotPasswordOtp: builder.mutation({
      query: (values) => ({
        url: endpoints.auth.verifyForgotPasswordOtp,
        method: REQUEST_METHODS.POST,
        body: values,
      }),
      transformResponse: (response: ResponseBody<VerifyOtpData>) => response,
    }),
    passwordReset: builder.mutation({
      query: (values) => ({
        url: endpoints.auth.passwordReset,
        method: REQUEST_METHODS.POST,
        body: values,
      }),
      transformResponse: (response: ResponseBody<any>) => response,
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  usePasswordResetMutation,
} = authService;
