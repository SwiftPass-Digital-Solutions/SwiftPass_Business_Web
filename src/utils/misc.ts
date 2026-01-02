import { APP_PATHS, MAX_COOKIES_AGE } from "@/constants";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
dayjs.extend(duration);
dayjs.extend(utc);

export { dayjs as dayJs };

export const getCookie = (name: string) => {
  try {
    const value = typeof window !== "undefined" ? `; ${document.cookie}` : "";
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const part = parts.pop()?.split(";").shift();
      return part ? decodeURIComponent(part) : null;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * @param cname
 * @param cvalue
 */
export const setCookie = (cname: string, cvalue: string, age?: number) => {
  if (typeof window !== "undefined") {
    document.cookie = `${cname}=${encodeURIComponent(cvalue)};max-age=${
      age || MAX_COOKIES_AGE
    };Secure;SameSite=Strict;path=/`;
  }
};

/**
 * @param cname
 */
export const expireCookie = (cname: string) => {
  if (typeof window !== "undefined") {
    document.cookie = `${cname}=;max-age=0;Secure;SameSite=Strict;path=/`;
  }
};

export const capitalizeStrings = (value = "") => {
  return !value || typeof value !== "string"
    ? ""
    : value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Extract a user-friendly error message from an error object
 * @param error - The error object
 * @returns {string} - The extracted error message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorMessage = (error: any): string => {
  // Handle field-level validation errors
  const fieldErrors = error?.response?.data?.errors || error?.errors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const messages = Object.values(fieldErrors).flat().filter(Boolean);
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return (
    error?.response?.data?.title ||
    (typeof error?.response?.data === "string"
      ? error?.response?.data || error?.response?.statusText
      : error?.response?.data?.message) ||
    error.error.message ||
    error.message ||
    "An unknown error occurred"
  );
};

/**
 *
 * @param  {...any} logs - The argument(s) to be logged
 * @returns {Function | undefined} Returns the native javascript console.log or undefined depending on the environment
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Logger = (...logs: any[]) =>
  import.meta.env.NODE_ENV === "development"
    ? console.log(...logs, `(Log time - ${dayjs().format("LLL")})`)
    : undefined;

export const handleLogoutRedirect = () => {
  if (typeof window !== "undefined") {
    expireCookie("_tk");
    expireCookie("_ar");
    window.location.replace(APP_PATHS.LOGIN);
  }
};

/**
 * Reads a file object and returns the data URL
 *
 * @param {File} file File object to be read
 * @returns {string} Data URL
 */
export const readFileToDataUrl = (
  file: Blob
): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });

/**
 *
 * @param {object} arguments The function arguments
 * @param {number} arguments.bytes Bytes to be converted
 * @param {number} arguments.decimals Decimal place to use
 * @returns {string} The converted bytes
 */

export const formatFileBytes = ({ bytes = 0, decimals = 2 }) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format value as money
 * @param value
 * @param currency
 * @param hideCurrency
 * @returns
 */
export const formatAsMoney = (
  value: number | string,
  currency = "USD",
  hideCurrency = false
): string => {
  if (typeof value === "string" && value.includes(",")) {
    value = value.replace(/,/g, "");
  }

  return new Intl.NumberFormat("en-US", {
    ...(!hideCurrency && {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(!isNaN(Number(value)) ? parseFloat(value.toString()) : 0);
};

export function capitalizeFirstLetter(text: string) {
  return text.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

export function getTimeIcon(): string {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return "☀️"; // Morning
  } else if (hour >= 12 && hour < 18) {
    return "🌤️"; // Afternoon
  } else {
    return "🌙"; // Night
  }
}
