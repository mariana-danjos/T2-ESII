import { FC, useEffect, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, Divider, Grid, Paper, Stack, TextField, Typography,
} from "@mui/material";
import { SupplierApi } from "../api/client";
import { Address, CreateSupplierPayload } from "../api/types";

interface Props {
  api: SupplierApi;
  supplierId?: string;
  onDone: () => void;
  onCancel: () => void;
}

interface FormState {
  legalName: string;
  tradeName: string;
  document: string;
  email: string;
  phone: string;
  contactPerson: string;
  address: Required<{ [K in keyof Address]: string }>;
}

const emptyAddress = {
  street: "", number: "", complement: "", district: "",
  city: "", state: "", zipCode: "", country: "",
};

const emptyForm: FormState = {
  legalName: "", tradeName: "", document: "", email: "", phone: "", contactPerson: "",
  address: { ...emptyAddress },
};

type Errors = Partial<Record<"legalName" | "document" | "email", string>>;

const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const SupplierFormPage: FC<Props> = ({ api, supplierId, onDone, onCancel }) => {
  const isEdit = Boolean(supplierId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supplierId) return;
    setLoading(true);
    api.getSupplier(supplierId)
      .then((s) => setForm({
        legalName: s.legalName ?? "",
        tradeName: s.tradeName ?? "",
        document: s.document ?? "",
        email: s.email ?? "",
        phone: s.phone ?? "",
        contactPerson: s.contactPerson ?? "",
        address: {
          street: s.address?.street ?? "", number: s.address?.number ?? "",
          complement: s.address?.complement ?? "", district: s.address?.district ?? "",
          city: s.address?.city ?? "", state: s.address?.state ?? "",
          zipCode: s.address?.zipCode ?? "", country: s.address?.country ?? "",
        },
      }))
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar fornecedor"))
      .finally(() => setLoading(false));
  }, [api, supplierId]);

  const setField = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));
  const setAddr = (field: keyof Address, value: string) =>
    setForm((f) => ({ ...f, address: { ...f.address, [field]: value } }));

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.legalName.trim()) next.legalName = "Razão Social é obrigatória";
    if (!form.document.trim()) next.document = "Documento é obrigatório";
    if (!isEmail(form.email)) next.email = "E-mail inválido";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    const nz = (v: string): string | null => (v.trim() ? v.trim() : null);
    const address: Address = {
      street: nz(form.address.street), number: nz(form.address.number),
      complement: nz(form.address.complement), district: nz(form.address.district),
      city: nz(form.address.city), state: nz(form.address.state),
      zipCode: nz(form.address.zipCode), country: nz(form.address.country),
    };
    try {
      if (isEdit && supplierId) {
        await api.updateSupplier(supplierId, {
          legalName: form.legalName, tradeName: nz(form.tradeName), email: form.email,
          phone: nz(form.phone), contactPerson: nz(form.contactPerson), address,
        });
      } else {
        const payload: CreateSupplierPayload = {
          legalName: form.legalName, tradeName: nz(form.tradeName), document: form.document,
          email: form.email, phone: nz(form.phone), contactPerson: nz(form.contactPerson), address,
        };
        await api.createSupplier(payload);
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar fornecedor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 880, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEdit ? "Editar fornecedor" : "Novo fornecedor"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Razão Social" value={form.legalName}
              error={Boolean(errors.legalName)} helperText={errors.legalName}
              onChange={(e) => setField("legalName", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Nome Fantasia" value={form.tradeName}
              onChange={(e) => setField("tradeName", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Documento (CNPJ/CPF)" value={form.document}
              disabled={isEdit}
              error={Boolean(errors.document)} helperText={errors.document}
              onChange={(e) => setField("document", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="E-mail" value={form.email}
              error={Boolean(errors.email)} helperText={errors.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Telefone" value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Pessoa de contato" value={form.contactPerson}
              onChange={(e) => setField("contactPerson", e.target.value)}
            />
          </Grid>

          <Grid size={12}><Divider>Endereço</Divider></Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField fullWidth label="Logradouro" value={form.address.street}
              onChange={(e) => setAddr("street", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Número" value={form.address.number}
              onChange={(e) => setAddr("number", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Complemento" value={form.address.complement}
              onChange={(e) => setAddr("complement", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Bairro" value={form.address.district}
              onChange={(e) => setAddr("district", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField fullWidth label="Cidade" value={form.address.city}
              onChange={(e) => setAddr("city", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField fullWidth label="Estado" value={form.address.state}
              onChange={(e) => setAddr("state", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField fullWidth label="CEP" value={form.address.zipCode}
              onChange={(e) => setAddr("zipCode", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="País" value={form.address.country}
              onChange={(e) => setAddr("country", e.target.value)} />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "flex-end" }}>
          <Button variant="text" onClick={onCancel} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SupplierFormPage;
