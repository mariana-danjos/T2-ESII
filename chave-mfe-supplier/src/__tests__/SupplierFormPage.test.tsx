import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupplierFormPage from '../pages/SupplierFormPage';
import { SupplierApi } from '../api/client';

const supplier = {
  id: 'id1', legalName: 'Plus Fashion LTDA', tradeName: 'Plus', document: '11222333000181',
  documentType: 'cnpj' as const, email: 'a@b.com', phone: null, contactPerson: null,
  status: 'active' as const, address: { city: 'POA', state: 'RS' }, createdAt: '', updatedAt: '',
};

it('validates required fields before submit', async () => {
  const api = { createSupplier: jest.fn() } as unknown as SupplierApi;
  render(<SupplierFormPage api={api} onDone={() => {}} onCancel={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
  expect(api.createSupplier).not.toHaveBeenCalled();
  // Validation error helperText is shown (unique message, not the field label/legend).
  expect(screen.getByText(/obrigatória/i)).toBeInTheDocument();
});

it('submits a valid new supplier', async () => {
  const api = { createSupplier: jest.fn().mockResolvedValue({ id: 'id1' }) } as unknown as SupplierApi;
  const onDone = jest.fn();
  render(<SupplierFormPage api={api} onDone={onDone} onCancel={() => {}} />);
  await userEvent.type(screen.getByLabelText(/razão social/i), 'Plus Fashion LTDA');
  await userEvent.type(screen.getByLabelText(/documento/i), '11.222.333/0001-81');
  await userEvent.type(screen.getByLabelText(/e-mail/i), 'contato@plus.com');
  await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
  await waitFor(() => expect(api.createSupplier).toHaveBeenCalled());
  await waitFor(() => expect(onDone).toHaveBeenCalled());
});

it('loads an existing supplier in edit mode and updates it', async () => {
  const api = {
    getSupplier: jest.fn().mockResolvedValue(supplier),
    updateSupplier: jest.fn().mockResolvedValue(supplier),
  } as unknown as SupplierApi;
  const onDone = jest.fn();
  render(<SupplierFormPage api={api} supplierId="id1" onDone={onDone} onCancel={() => {}} />);
  await waitFor(() => expect(screen.getByLabelText(/razão social/i)).toHaveValue('Plus Fashion LTDA'));
  expect(api.getSupplier).toHaveBeenCalledWith('id1');
  await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
  await waitFor(() => expect(api.updateSupplier).toHaveBeenCalled());
  await waitFor(() => expect(onDone).toHaveBeenCalled());
});

it('cancels via the cancel button', async () => {
  const api = { createSupplier: jest.fn() } as unknown as SupplierApi;
  const onCancel = jest.fn();
  render(<SupplierFormPage api={api} onDone={() => {}} onCancel={onCancel} />);
  await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
  expect(onCancel).toHaveBeenCalled();
});
