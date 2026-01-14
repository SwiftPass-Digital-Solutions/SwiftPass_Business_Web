import { APIM_SUB_KEY, BASE_API_URL } from "@/constants";
import { getCookie, handleLogoutRedirect } from "@/utils";
import {
  BaseQueryFn,
  FetchArgs,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${BASE_API_URL}`,
  credentials: "same-origin",
  prepareHeaders: (headers) => {
    const token: string | null = getCookie("_tk");
    headers.set("Access-Control-Allow-Origin", "*");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (APIM_SUB_KEY) {
      headers.set("Ocp-Apim-Subscription-Key", APIM_SUB_KEY);
    }
    return headers;
  },
  validateStatus: (response) => {
    if (response.status === 401) {
      if (typeof globalThis.window !== "undefined") {
        handleLogoutRedirect();
      }
    }

    return true;
  },
}) as BaseQueryFn<string | FetchArgs, unknown, unknown, object>;

export const apiSlice = createApi({
  reducerPath: "api-slice",
  baseQuery,
  tagTypes: ["DashboardStatus", "Credits", "User"],
  endpoints: () => ({}),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});
