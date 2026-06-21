import { FC, useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { SupplierApi, ListParams } from "../api/client";
import { Supplier } from "../api/types";

interface Props {
  api: SupplierApi;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
}

interface Filters {
  q: string;
  status: string;
  city: string;
  state: string;
}

const emptyFilters: Filters = { q: "", status: "", city: "", state: "" };

const SupplierListPage: FC<Props> = ({ api, onCreate, onOpen, onEdit }) => {
  const [rows, setRows] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ListParams = {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        q: applied.q || undefined,
        status: applied.status || undefined,
        city: applied.city || undefined,
        state: applied.state || undefined,
      };
      const res = await api.listSuppliers(params);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  }, [api, paginationModel, applied]);

  useEffect(() => { void load(); }, [load]);

  const onSearch = () => {
    setPaginationModel((m) => ({ ...m, page: 0 }));
    setApplied(draft);
  };

  const handleInactivate = async (id: string) => {
    try {
      await api.inactivateSupplier(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao inativar");
    }
  };

  const columns: GridColDef<Supplier>[] = [
    { field: "legalName", headerName: "Razão Social", flex: 1, minWidth: 180 },
    { field: "tradeName", headerName: "Nome Fantasia", flex: 1, minWidth: 140 },
    { field: "document", headerName: "Documento", width: 160 },
    {
      field: "status", headerName: "Status", width: 110,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.status === "active" ? "Ativo" : "Inativo"}
          color={params.row.status === "active" ? "success" : "default"}
        />
      ),
    },
    {
      field: "city", headerName: "Cidade", width: 140,
      valueGetter: (_value, row) => row.address?.city ?? "",
    },
    {
      field: "actions", headerName: "Ações", width: 220, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="text" onClick={() => onOpen(params.row.id)}>Abrir</Button>
          <Button size="small" variant="text" onClick={() => onEdit(params.row.id)}>Editar</Button>
          <Button
            size="small" variant="text" color="error"
            disabled={params.row.status === "inactive"}
            onClick={() => handleInactivate(params.row.id)}
          >
            Inativar
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5">Fornecedores</Typography>
        <Button onClick={onCreate}>Novo fornecedor</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
          <TextField
            label="Buscar" size="small" value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
          />
          <TextField
            select label="Status" size="small" sx={{ minWidth: 140 }} value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="active">Ativo</MenuItem>
            <MenuItem value="inactive">Inativo</MenuItem>
          </TextField>
          <TextField
            label="Cidade" size="small" value={draft.city}
            onChange={(e) => setDraft({ ...draft, city: e.target.value })}
          />
          <TextField
            label="Estado" size="small" value={draft.state}
            onChange={(e) => setDraft({ ...draft, state: e.target.value })}
          />
          <Button onClick={onSearch}>Buscar</Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          rowCount={total}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default SupplierListPage;
