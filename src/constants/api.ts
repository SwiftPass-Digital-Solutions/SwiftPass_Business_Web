export const BASE_API_URL = import.meta.env.VITE_API_URL;
export const APIM_SUB_KEY = import.meta.env.VITE_SUB_KEY || "";

export const REQUEST_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  CONNECT: "CONNECT",
};

export const endpoints = {
  auth: {
    login: "/identity/business/login",
    forgotPassword: (email: string) =>
      `/identity/business/forgot-password?email=${email}`,
    verifyForgotPasswordOtp: "/identity/business/forgot-password/verify-otp",
    passwordReset: "/identity/business/forgot-password/reset",
  },
  identity: {
    initiate: "/identity/business/initiate",
    businessTypes: "/identity/business/business-types",
    verifyOtp: "/identity/business/verify-otp",
    resendOtp: (email: string) =>
      `/identity/business/resend-email-otp/?email=${email}`,
    setPassword: "/identity/business/set-password",
    uploadDocuments: "/identity/business/upload-document",
    documentCategories: "/identity/business/document-categories",
  },
  dashboard: {
    status: "/identity/business/status",
  },
  credits: {
    analytics: "/credits/dashboard-analytics",
  },
};
