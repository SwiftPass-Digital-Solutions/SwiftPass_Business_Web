export * from "./api";
export * from "./mocks";
export * from "./enums";

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
  DOCUMENT_CATEGORIES: "/compliance/document-categories",
  CUSTOMERS: "/customers",

  // notifications
  NOTIFICATIONS: "/notifications",
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
    "Track their KYC status, view documents, and monitor onboarding activity in real time",
  "api-&-credits": "View the details of your APIs and credits all here",
  settings:
    "Manage your business profile, team access, and account security all in one place",
  "document-categories": "View your full categories",
  notifications: "Go through your notifications here",
};

export const NAV_HEADER = {
  dashboard: (businessName: string) => `Welcome to SwiftPass, ${businessName}!`,
  "knowledge-base": "Internal wiki and support documentation",
  compliance: "Stay compliant. Stay trusted.",
  customers: "Manage all customers onboarded through SwiftPass",
  "api-&-credits": "APIs & Credits",
  reports: "Insights that keep you informed",
  settings: "Customize and secure your SwiftPass experience",
  "document-categories": "Document Categories",
  notifications: "Notifications",
};

export const categories = [
  {
    categoryName: "CorporateRegistration",
    subCategories: [
      { subCategoryId: 1, subCategoryName: "CACCertificate" },
      { subCategoryId: 2, subCategoryName: "CACForm" },
    ],
  },
  {
    categoryName: "TaxCompliance",
    subCategories: [
      { subCategoryId: 1, subCategoryName: "VATCertificate" },
      { subCategoryId: 2, subCategoryName: "TINCertificate" },
    ],
  },
  {
    categoryName: "DirectorId",
    subCategories: [
      { subCategoryId: 1, subCategoryName: "Passport" },
      { subCategoryId: 2, subCategoryName: "NIN" },
      { subCategoryId: 3, subCategoryName: "DriversLicense" },
    ],
  },
  {
    categoryName: "License",
    subCategories: [
      { subCategoryId: 1, subCategoryName: "SCUML" },
      { subCategoryId: 2, subCategoryName: "IndustryLicense" },
    ],
  },
];

export const SUB_CATEGORY_LABELS: Record<string, string> = {
  CACCertificate: "CAC Certificate",
  CACForm: "CAC Form",
  VATCertificate: "VAT Certificate",
  TINCertificate: "TIN Certificate",
  DriversLicense: "Drivers License",
  IndustryLicense: "Industry License",
};

export const CATEGORY_LABELS: Record<string, string> = {
  CorporateRegistration: "Corporate Registration",
  DirectorId: "Director Id",
  License: "License",
  TaxCompliance: "Tax Compliance",
};
