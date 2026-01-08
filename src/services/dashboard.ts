import { endpoints, REQUEST_METHODS } from "@/constants";
import { apiSlice } from "@/store";
import { ResponseBody } from "@/types";

type BusinessStatus = "Pending" | "Completed" | string;

type UploadedDocument = {
  // Adjust when backend starts returning document details
};

interface StatusData {
  email: string;
  businessName: string;
  status: BusinessStatus;
  isEmailConfirmed: boolean;
  hasSetPassword: boolean;
  hasUploadedDocuments: boolean;
  documentsUploadedCount: number;
  approvedDocumentsCount: number;
  rejectedDocumentsCount: number;
  pendingDocumentsCount: number;
  complianceScore: number;
  uploadedDocuments: UploadedDocument[];
}

export const authService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    dashboardStatus: builder.query({
      query: () => ({
        url: endpoints.dashboard.status,
        method: REQUEST_METHODS.GET,
      }),
      providesTags: ["DashboardStatus"],
      transformResponse: (response: ResponseBody<StatusData>) => response,
    }),
  }),
});

export const { useDashboardStatusQuery } = authService;
