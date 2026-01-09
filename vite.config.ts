import { defineConfig, Plugin, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

const CSP_DEV =
  "default-src 'self' 'unsafe-inline' http://localhost:5173 swiftpass-backend.onrender.com fonts.googleapis.com; img-src 'self' blob: data: https: https://lh3.googleusercontent.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;";

const CSP_PROD =
  "default-src 'self' swiftpass-backend.onrender.com fonts.googleapis.com; img-src 'self' https: data: blob: https://lh3.googleusercontent.com; script-src 'self'; style-src 'self'; style-src-elem 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' swiftpass-backend.onrender.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;";

function cspMetaPlugin(csp: string): Plugin {
  return {
    name: "vite-csp-meta",
    transformIndexHtml(html) {
      return html.replace(
        /<head>/,
        `<head>\n<meta http-equiv="Content-Security-Policy" content="${csp}">`
      );
    },
  };
}

export default defineConfig(({ mode }: ConfigEnv) => ({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    mode === "production" ? cspMetaPlugin(CSP_PROD) : undefined,
  ],
  server: {
    port: 3001,
    // Dev-only headers
    headers: {
      "Content-Security-Policy": CSP_DEV,
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
}));
