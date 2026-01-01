export * from "./api";
export * from "./mocks";

export const APP_PATHS = {
  LOGIN: "/",
  FORGOT_PASSWORD: "/forgot-password",
  OTP: "/otp",
  CONFIRM_PASSWORD: "/confirm-password",
  REGISTRATION: "/onboarding/registration",
  ONBOARDING_OTP: "/onboarding/otp",
  CREATE_ACCOUNT: "/onboarding/create-account",
  UPLOAD_DOCS: "/onboarding/upload-docs",

  // dashboards
  DASHBOARD: "/dashboard",
  COMPLIANCE: "/compliance",
};

export const MAX_COOKIES_AGE = 3600 * 24;

export enum DocTypes {
  pdf = 1,
  jpg = 2,
  png = 3,
  doc = 4,
  xls = 5,
}

export const NAV_DESCRIPTION = {
  dashboard:
    "You're almost ready to go live. Complete your onboarding to unlock full access",
  "knowledge-base": "Internal wiki and support documentation",
  compliance:
    "Keep your business documents up to date to maintain verification and avoid interruptions in customer onboarding",
  reports:
    "Track onboarding trends, API performance, and compliance history in one place",
  customers:
    "rack their KYC status, view documents, and monitor onboarding activity in real time",
  "api-&-credits": "View the details of your APIs and credits all here",
  settings:
    "Manage your business profile, team access, and account security all in one place",
};

export const NAV_HEADER = {
  dashboard: "Welcome to SwiftPass, Kems Business!",
  "knowledge-base": "Internal wiki and support documentation",
  compliance: "Stay compliant. Stay trusted.",
  customers: "Manage all customers onboarded through SwiftPass",
  "api-&-credits": "APIs & Credits",
  reports: "Insights that keep you informed",
  settings: "Customize and secure your SwiftPass experience",
};
