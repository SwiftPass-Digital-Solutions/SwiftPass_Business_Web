import { createSlice } from "@reduxjs/toolkit";

type AlertType = "error" | "success" | "info" | "warning";

interface AppState {
  loading: boolean;
  loadingText: string;
  error: boolean;
  errorText: string;
  sidebarOpen: boolean;
  alert: {
    open: boolean;
    type: AlertType;
    message: string;
  };
}

const initialState: AppState = {
  loading: false,
  loadingText: "",
  error: false,
  errorText: "",
  sidebarOpen: true,
  alert: {
    open: false,
    type: "error",
    message: "",
  },
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleSideBar: (state) => ({
      ...state,
      sidebarOpen: !state.sidebarOpen,
    }),
    startLoading: (state, { payload }) => {
      state.loading = true;
      state.loadingText = payload || "";
    },
    endLoading: (state) => {
      state.loading = false;
      state.loadingText = "";
    },
    startError: (state, { payload }) => {
      state.error = true;
      state.errorText = payload || "";
    },
    endError: (state) => {
      state.error = false;
      state.errorText = "";
    },
    triggerAlert: (state, { payload }) => {
      state.alert = {
        open: true,
        type: payload.type || "error",
        message: payload.message,
      };
    },
    clearAlert: (state) => {
      state.alert = {
        open: false,
        type: "error",
        message: "",
      };
    },
  },
});

export const {
  toggleSideBar,
  startLoading,
  endLoading,
  startError,
  endError,
  triggerAlert,
  clearAlert,
} = appSlice.actions;

export default appSlice.reducer;
