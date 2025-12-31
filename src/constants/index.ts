export * from "./api";
export * from "./mocks";

export const APP_PATHS = {
  HOME: "/",
  FORGOT_PASSWORD: "/forgot-password",
  OTP: "/otp",
  CONFIRM_PASSWORD: "/confirm-password",
  DASHBOARD: "/dashboard",
  REGISTRATION: "/onboarding/registration",
  ONBOARDING_OTP: "/onboarding/otp",
  CREATE_ACCOUNT: "/onboarding/create-account",
  UPLOAD_DOCS: "/onboarding/upload-docs",
};

export const MAX_COOKIES_AGE = 3600 * 24;

export enum DocTypes {
  pdf = 1,
  jpg = 2,
  png = 3,
  doc = 4,
  xls = 5,
}

export const NAV_HEADER = {
  dashboard: "Real-time metrics and SLA overview",
  "knowledge-base": "Internal wiki and support documentation",
  tickets: "Open tickets requiring attention",
  reports: "CSAT, NPS and performance analytics",
  customers: "Manage and view customer profiles",
  settings: "Manage team roles and automation rules",
};
