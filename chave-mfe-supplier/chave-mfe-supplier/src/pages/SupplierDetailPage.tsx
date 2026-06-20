import { FC, useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Tab, Table, TableBody,
  TableCell, TableHead, TableRow, Tabs, Typography,
} from "@mui/material";
import { SupplierApi } from "../api/client";
import {
  LinkProductPayload, CreateReplenishmentPayload, ReplenishmentOrder, Supplier, SupplierProduct,
} from "../api/types";
import LinkProductDialog from "../components/LinkProductDialog";
import ReplenishmentDialog from "../components/ReplenishmentDialog";

interface Props {
  api: SupplierApi;
  supplierId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  requested: "Solicitado", sent: "Enviado", received: "Recebido", cancelled: "Cancelado",
};

const SupplierDetailPage: FC<Props> = ({ api, supplierId, onBack, onEdit }) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [orders, setOrders] = useState<ReplenishmentOrder[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [replOpen, setReplOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p, o] = await Promise.all([
        api.getSupplier(supplierId),
        api.listProducts(supplierId),
        api.listReplenishments(supplierId),
      ]);
      setSupplier(s);
      setProducts(p);
      setOrders(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar fornecedor");
    } finally {
      setLoading(false);
    }
  }, [api, supplierId]);

  useEffect(() => { void load(); }, [load]);

  const handleLink = async (payload: LinkProductPayload) => {
    setLinkOpen(false);
    try {
      await api.linkProduct(supplierId, payload);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao vincular produto");
    }
  };

  const handleUnlink = async (productId: string) => {
    try {
      await api.unlinkProduct(supplierId, productId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao desvincular produto");
    }
  };

  const handleReplenishment = async (payload: CreateReplenishmentPayload) => {
    setReplOpen(false);
    try {
      await api.createReplenishment(supplierId, payload);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao registrar reposição");
    }
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  }

  if (!supplier) {
    return (
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button variant="text" onClick={onBack}>Voltar</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
      <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h5">{supplier.legalName}</Typography>
          <Chip size="small" label={supplier.status === "active" ? "Ativo" : "Inativo"}
            color={supplier.status === "active" ? "success" : "default"} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="text" onClick={onBack}>Voltar</Button>
          <Button onClick={() => onEdit(supplier.id)}>Editar</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab label="Dados" />
          <Tab label="Produtos vinculados" />
          <Tab label="Reposições" />
        </Tabs>
        <Divider />

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography><b>Nome fantasia:</b> {supplier.tradeName ?? "—"}</Typography>
              <Typography><b>Documento:</b> {supplier.document} ({supplier.documentType.toUpperCase()})</Typography>
              <Typography><b>E-mail:</b> {supplier.email}</Typography>
              <Typography><b>Telefone:</b> {supplier.phone ?? "—"}</Typography>
              <Typography><b>Contato:</b> {supplier.contactPerson ?? "—"}</Typography>
              <Typography><b>Cidade/UF:</b> {supplier.address?.city ?? "—"} / {supplier.address?.state ?? "—"}</Typography>
            </Stack>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "flex-end" }}>
              <Button onClick={() => setLinkOpen(true)}>Vincular produto</Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell>Preço</TableCell>
                  <TableCell>Lead time</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 && (
                  <TableRow><TableCell colSpan={5}>Nenhum produto vinculado.</TableCell></TableRow>
                )}
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.productId}</TableCell>
                    <TableCell>{p.supplyPrice ?? "—"}</TableCell>
                    <TableCell>{p.leadTimeDays ?? "—"}</TableCell>
                    <TableCell>{p.supplierSku ?? "—"}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text" color="error"
                        onClick={() => handleUnlink(p.productId)}>Desvincular</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "flex-end" }}>
              <Button onClick={() => setReplOpen(true)}>Registrar reposição</Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Itens</TableCell>
                  <TableCell>Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 && (
                  <TableRow><TableCell colSpan={5}>Nenhuma reposição registrada.</TableCell></TableRow>
                )}
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{STATUS_LABEL[o.status] ?? o.status}</TableCell>
                    <TableCell>{o.totalCost ?? "—"}</TableCell>
                    <TableCell>{o.items.length}</TableCell>
                    <TableCell>{o.orderedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <LinkProductDialog open={linkOpen} onClose={() => setLinkOpen(false)} onSubmit={handleLink} />
      <ReplenishmentDialog open={replOpen} onClose={() => setReplOpen(false)} onSubmit={handleReplenishment} />
    </Box>
  );
};

export default SupplierDetailPage;
