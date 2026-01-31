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
    login: `${BASE_API_URL}/identity/business/login`,
    forgotPassword: (email: string) =>
      `/identity/business/forgot-password?email=${email}`,
    verifyForgotPasswordOtp: "/identity/business/forgot-password/verify-otp",
    passwordReset: "/identity/business/forgot-password/reset",
  },
  identity: {
    initiate: `${BASE_API_URL}/identity/business/initiate`,
    businessTypes: `${BASE_API_URL}/identity/business/business-types`,
    verifyOtp: `${BASE_API_URL}/identity/business/verify-otp`,
    resendOtp: (email: string) =>
      `${BASE_API_URL}/identity/business/resend-email-otp/?email=${email}`,
    setPassword: `${BASE_API_URL}/identity/business/set-password`,
    uploadDocuments: `${BASE_API_URL}/identity/business/upload-document`,
    documentCategories: `${BASE_API_URL}/identity/business/document-categories`,
  },
  dashboard: {
    status: `${BASE_API_URL}/identity/business/status`,
  },
  credits: {
    analytics: `${BASE_API_URL}/credits/dashboard-analytics`,
    packages: `${BASE_API_URL}/credits/packages`,
    customPackage: `${BASE_API_URL}/credits/custom-package`,
    buy: `${BASE_API_URL}/credits/buy`,
  },
  apiManagement: {
    getCustomers: `${BASE_API_URL}/api-management/customers`,
    getCustomersDetails: (customerId: string) =>
      `/api-management/customers/${customerId}`,
    generateApiKey: `${BASE_API_URL}/api-management/generate-api-key`,
    regenerateApiKey: `${BASE_API_URL}/api-management/regenerate-api-key`,
    revokeApiKey: `${BASE_API_URL}/api-management/revoke-api-key`,
  },
  notifications: {
    getNotifications: `${BASE_API_URL}/notifications`,
    readNotification: (id: number) => `${BASE_API_URL}/notifications/${id}/read`,
  },
};
