import { endpoints, REQUEST_METHODS } from "@/constants";
import { apiSlice } from "@/store";
import { Notifications, ResponseBody } from "@/types";

interface NotificationsResponse {
  data: Notifications[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export const notificationService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    notifications: builder.query({
      query: (params) => ({
        url: endpoints.notifications.getNotifications,
        method: REQUEST_METHODS.GET,
        params: params,
      }),
      providesTags: ["Notifications"],
      transformResponse: (response: ResponseBody<NotificationsResponse>) =>
        response,
    }),

    readNotification: builder.mutation({
      query: ({ id }: { id: number }) => ({
        url: endpoints.notifications.readNotification(id),
        method: REQUEST_METHODS.PATCH,
      }),
      invalidatesTags: ["Notifications"],
      transformResponse: (response: ResponseBody<boolean>) => response,
    }),
  }),
});

export const { useNotificationsQuery, useReadNotificationMutation } =
  notificationService;
