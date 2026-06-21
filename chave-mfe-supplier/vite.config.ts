import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_supplier",
      filename: "remoteEntry.js",
      exposes: {
        "./SupplierApp": "./src/pages/SupplierApp.tsx",
        "./SupplierListPage": "./src/pages/SupplierListPage.tsx",
        "./SupplierFormPage": "./src/pages/SupplierFormPage.tsx",
        "./SupplierDetailPage": "./src/pages/SupplierDetailPage.tsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
      },
    }),
  ],
  build: { target: "esnext", minify: false },
  server: { port: 4002, host: true },
  preview: { port: 4002, host: true },
});
