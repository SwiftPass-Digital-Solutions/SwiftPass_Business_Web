import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

const CSP_DEV =
  "default-src 'self' 'unsafe-inline' http://localhost:5173 swiftpass-backend.onrender.com fonts.googleapis.com; img-src 'self' blob: data: https: https://lh3.googleusercontent.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src https://checkout.paystack.com; frame-ancestors 'none'; upgrade-insecure-requests;";

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