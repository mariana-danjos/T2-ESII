import { FC, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField,
} from "@mui/material";
import { LinkProductPayload } from "../api/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: LinkProductPayload) => void;
}

const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));

const LinkProductDialog: FC<Props> = ({ open, onClose, onSubmit }) => {
  const [productId, setProductId] = useState("");
  const [supplyPrice, setSupplyPrice] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [supplierSku, setSupplierSku] = useState("");

  const handleSubmit = () => {
    if (!productId.trim()) return;
    onSubmit({
      productId: productId.trim(),
      supplyPrice: num(supplyPrice),
      leadTimeDays: num(leadTimeDays),
      supplierSku: supplierSku.trim() || null,
    });
    setProductId(""); setSupplyPrice(""); setLeadTimeDays(""); setSupplierSku("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Vincular produto</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="ID do produto" value={productId} required
            onChange={(e) => setProductId(e.target.value)} />
          <TextField label="Preço de fornecimento" type="number" value={supplyPrice}
            onChange={(e) => setSupplyPrice(e.target.value)} />
          <TextField label="Lead time (dias)" type="number" value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(e.target.value)} />
          <TextField label="SKU do fornecedor" value={supplierSku}
            onChange={(e) => setSupplierSku(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!productId.trim()}>Vincular</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkProductDialog;
