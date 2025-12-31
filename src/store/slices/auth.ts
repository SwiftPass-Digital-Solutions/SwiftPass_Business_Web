import { getCookie } from "@/utils";
import { createSlice } from "@reduxjs/toolkit";

interface IAuth {
  loggedIn: boolean;
  email: string | null;
  username: string | null;
}

const initialState: IAuth = {
  loggedIn: !!getCookie("_tk"),
  email: null,
  username: null,
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
        username: payload?.username,
      };
    },
    logout: () => initialState,
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
