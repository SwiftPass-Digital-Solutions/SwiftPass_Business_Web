export const BASE_API_URL = import.meta.env.VITE_API_URL;
export const APIM_SUB_KEY = import.meta.env.VITE_SUB_KEY || "";

export const REQUEST_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  CONNECT: "CONNECT",
};

export const endpoints = {
  auth: {
    login: "/auth/login",
  },
};
