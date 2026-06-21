import { SupplierApi } from "./client";

// Kept in its own module: `import.meta.env` is a Vite-only construct and cannot be
// parsed inside a CommonJS module (ts-jest), so it must not live in client.ts, which
// the unit tests load directly.
export const createApi = (): SupplierApi =>
  new SupplierApi(import.meta.env.VITE_MS_SUPPLIER_URL || "http://localhost:3002");
