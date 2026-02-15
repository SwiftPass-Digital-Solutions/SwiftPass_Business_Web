import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

const CSP_DEV =
  "default-src 'self'; " +
  "connect-src 'self' https://swiftpass-backend.onrender.com https://api.paystack.co; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co; " +
  "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' blob: data: https: https://lh3.googleusercontent.com; " +
  "frame-src https://checkout.paystack.com; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "frame-ancestors 'none';";

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    port: 3001,
    headers: {
      "Content-Security-Policy": CSP_DEV,
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});