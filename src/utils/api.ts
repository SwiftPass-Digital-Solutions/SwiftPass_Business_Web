import { getCookie } from "./misc";

export const getAuthHeaders = (contentType = "application/json") => {
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;
  headers.accept = "*/*";

  const token = getCookie("_tk");
  if (token) headers.Authorization = `Bearer ${token}`;

  return {
    headers,
    credentials: "include" as RequestCredentials,
  };
};

export default getAuthHeaders;
