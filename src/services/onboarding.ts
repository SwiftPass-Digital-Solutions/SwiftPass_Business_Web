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

interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
  subCategoryDisplayName: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDisplayName: string;
  isRequired: boolean;
  subCategories: SubCategory[];
}

interface CategoriesData {
  categories: Category[];
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
      transformResponse: (response: ResponseBody<BusinessTypesData>) =>
        response,
    }),
    getDocumentCategory: builder.query({
      query: () => ({
        url: endpoints.identity.documentCategories,
        method: REQUEST_METHODS.GET,
      }),
      transformResponse: (response: ResponseBody<CategoriesData>) => response,
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
    setPassword: builder.mutation({
      query: (values) => ({
        url: endpoints.identity.setPassword,
        method: REQUEST_METHODS.POST,
        body: values,
      }),
      transformResponse: (response: ResponseBody<any>) => response,
    }),
    uploadDocs: builder.mutation({
      query: (values) => {
        const formData = new FormData();
        values?.email && formData.append("Email", values.email);
        values?.documentCategory &&
          formData.append("DocumentCategory", values.documentCategory);
        values?.documentSubType &&
          formData.append("DocumentSubType", values.documentSubType.toString());
        values?.file && formData.append("File", values.file);

        return {
          url: endpoints.identity.uploadDocuments,
          method: REQUEST_METHODS.POST,
          body: formData,
        };
      },
      invalidatesTags: ["DashboardStatus"],
      transformResponse: (response: ResponseBody<any>) => response,
    }),
  }),
});

export const {
  useInitiateMutation,
  useBusinessTypesQuery,
  useGetDocumentCategoryQuery,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useSetPasswordMutation,
  useUploadDocsMutation,
} = onboardingService;
