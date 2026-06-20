import { FC, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../theme";
import { createApi } from "../api/createApi";
import SupplierListPage from "./SupplierListPage";
import SupplierFormPage from "./SupplierFormPage";
import SupplierDetailPage from "./SupplierDetailPage";

type View =
  | { name: "list" }
  | { name: "create" }
  | { name: "edit"; id: string }
  | { name: "detail"; id: string };

const SupplierApp: FC = () => {
  const api = useMemo(() => createApi(), []);
  const [view, setView] = useState<View>({ name: "list" });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {view.name === "list" && (
        <SupplierListPage
          api={api}
          onCreate={() => setView({ name: "create" })}
          onOpen={(id) => setView({ name: "detail", id })}
          onEdit={(id) => setView({ name: "edit", id })}
        />
      )}
      {(view.name === "create" || view.name === "edit") && (
        <SupplierFormPage
          api={api}
          supplierId={view.name === "edit" ? view.id : undefined}
          onDone={() => setView({ name: "list" })}
          onCancel={() => setView({ name: "list" })}
        />
      )}
      {view.name === "detail" && (
        <SupplierDetailPage
          api={api}
          supplierId={view.id}
          onBack={() => setView({ name: "list" })}
          onEdit={(id) => setView({ name: "edit", id })}
        />
      )}
    </ThemeProvider>
  );
};

export default SupplierApp;
