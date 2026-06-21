import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

const MFE_AUTH_URL =
  process.env.MFE_AUTH_URL || "http://localhost:4001/assets/remoteEntry.js";
const MFE_SUPPLIER_URL =
  process.env.MFE_SUPPLIER_URL || "http://localhost:4002/assets/remoteEntry.js";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        // O Shell consome o remoteEntry exposto pelo chave-mfe-auth
        mfe_auth: MFE_AUTH_URL,
        // ...e o remoteEntry exposto pelo chave-mfe-supplier
        mfe_supplier: MFE_SUPPLIER_URL,
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: "^18.2.0" },
        "react-dom": { singleton: true, eager: true, requiredVersion: "^18.2.0" },
      },
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
