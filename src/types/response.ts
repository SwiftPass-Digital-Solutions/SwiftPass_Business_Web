export interface ResponseBody<T> {
  status: boolean;
  message: string;
  traceId: string;
  data: T;
}

export type BusinessStatus = "Pending" | "Completed" | string;

export type DocumentCategory =
  | "CorporateRegistration"
  | "TaxCompliance"
  | "DirectorId"
  | "License"
  | string;

export type VerificationStatus = "Pending" | "Approved" | "Rejected";

export type UploadedDocument = {
  category: DocumentCategory;
  documentSubType: number;
  documentName: string;
  documentUrl: string;
  verificationStatus: VerificationStatus;
  uploadedAt: string;
  lastUpdated: string | null;
};
