import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupplierListPage from '../pages/SupplierListPage';
import { SupplierApi } from '../api/client';

const supplier = {
  id: 'id1', legalName: 'Plus Fashion', tradeName: 'Plus', document: '11222333000181',
  documentType: 'cnpj' as const, email: 'a@b.com', phone: null, contactPerson: null,
  status: 'active' as const, address: { city: 'POA', state: 'RS' }, createdAt: '', updatedAt: '',
};

const page = { data: [supplier], page: 1, pageSize: 20, total: 1 };

it('renders suppliers from the API', async () => {
  const api = { listSuppliers: jest.fn().mockResolvedValue(page) } as unknown as SupplierApi;
  render(<SupplierListPage api={api} onCreate={() => {}} onOpen={() => {}} onEdit={() => {}} />);
  await waitFor(() => expect(screen.getByText('Plus Fashion')).toBeInTheDocument());
  expect(api.listSuppliers).toHaveBeenCalled();
});

it('shows error alert on failure', async () => {
  const api = { listSuppliers: jest.fn().mockRejectedValue(new Error('Falha de rede')) } as unknown as SupplierApi;
  render(<SupplierListPage api={api} onCreate={() => {}} onOpen={() => {}} onEdit={() => {}} />);
  await waitFor(() => expect(screen.getByText(/Falha de rede/)).toBeInTheDocument());
});

it('fires onCreate and re-queries on search', async () => {
  const api = { listSuppliers: jest.fn().mockResolvedValue(page) } as unknown as SupplierApi;
  const onCreate = jest.fn();
  render(<SupplierListPage api={api} onCreate={onCreate} onOpen={() => {}} onEdit={() => {}} />);
  await waitFor(() => screen.getByText('Plus Fashion'));
  await userEvent.click(screen.getByRole('button', { name: /novo fornecedor/i }));
  expect(onCreate).toHaveBeenCalled();
  await userEvent.type(screen.getByLabelText(/buscar/i), 'plus');
  await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
  await waitFor(() => expect((api.listSuppliers as jest.Mock).mock.calls.length).toBeGreaterThan(1));
});

it('inactivates a supplier from the row action', async () => {
  const api = {
    listSuppliers: jest.fn().mockResolvedValue(page),
    inactivateSupplier: jest.fn().mockResolvedValue(supplier),
  } as unknown as SupplierApi;
  render(<SupplierListPage api={api} onCreate={() => {}} onOpen={() => {}} onEdit={() => {}} />);
  await waitFor(() => screen.getByText('Plus Fashion'));
  await userEvent.click(screen.getByRole('button', { name: /inativar/i }));
  await waitFor(() => expect(api.inactivateSupplier).toHaveBeenCalledWith('id1'));
});
