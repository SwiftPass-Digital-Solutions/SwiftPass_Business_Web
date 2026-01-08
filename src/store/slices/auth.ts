import { getCookie } from "@/utils";
import { createSlice } from "@reduxjs/toolkit";

type UserType = "Business" | "Individual";

interface IAuth {
  loggedIn: boolean;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  userType: UserType | null;
}

const initialState: IAuth = {
  loggedIn: !!getCookie("_tk"),
  email: null,
  firstName: "",
  lastName: "",
  businessName: "",
  userType: null,
};

export const authSlice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    loginSuccess: (state, action) => {
      const { payload } = action;
      return {
        ...state,
        loggedIn: true,
        email: payload?.email,
        firstName: payload?.firstName,
        lastName: payload?.lastName,
        businessName: payload?.businessName,
        userType: payload?.userType,
      };
    },
    logout: () => initialState,
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
