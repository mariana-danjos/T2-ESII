import { FC, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem,
  Stack, TextField, Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { CreateReplenishmentPayload, ReplenishmentStatus } from "../api/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReplenishmentPayload) => void;
}

interface ItemRow {
  productId: string;
  quantity: string;
  unitCost: string;
}

const STATUSES: ReplenishmentStatus[] = ["requested", "sent", "received", "cancelled"];
const STATUS_LABEL: Record<ReplenishmentStatus, string> = {
  requested: "Solicitado", sent: "Enviado", received: "Recebido", cancelled: "Cancelado",
};

const emptyRow: ItemRow = { productId: "", quantity: "1", unitCost: "" };

const ReplenishmentDialog: FC<Props> = ({ open, onClose, onSubmit }) => {
  const [status, setStatus] = useState<ReplenishmentStatus>("requested");
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyRow }]);

  const setItem = (idx: number, field: keyof ItemRow, value: string) =>
    setItems((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  const addRow = () => setItems((rows) => [...rows, { ...emptyRow }]);
  const removeRow = (idx: number) => setItems((rows) => rows.filter((_, i) => i !== idx));

  const valid = items.length > 0 && items.every((r) => r.productId.trim() && Number(r.quantity) > 0);

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit({
      status,
      items: items.map((r) => ({
        productId: r.productId.trim(),
        quantity: Number(r.quantity),
        unitCost: r.unitCost.trim() === "" ? null : Number(r.unitCost),
      })),
    });
    setStatus("requested");
    setItems([{ ...emptyRow }]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Registrar reposição</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Status" value={status} sx={{ maxWidth: 220 }}
            onChange={(e) => setStatus(e.target.value as ReplenishmentStatus)}>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>)}
          </TextField>
          <Typography variant="subtitle2">Itens</Typography>
          {items.map((row, idx) => (
            <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <TextField label="ID do produto" value={row.productId} sx={{ flex: 1 }}
                onChange={(e) => setItem(idx, "productId", e.target.value)} />
              <TextField label="Qtd" type="number" value={row.quantity} sx={{ width: 100 }}
                onChange={(e) => setItem(idx, "quantity", e.target.value)} />
              <TextField label="Custo unit." type="number" value={row.unitCost} sx={{ width: 140 }}
                onChange={(e) => setItem(idx, "unitCost", e.target.value)} />
              <IconButton aria-label="Remover item" disabled={items.length === 1}
                onClick={() => removeRow(idx)}><DeleteIcon /></IconButton>
            </Stack>
          ))}
          <Button variant="text" onClick={addRow} sx={{ alignSelf: "flex-start" }}>
            Adicionar item
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!valid}>Registrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReplenishmentDialog;
