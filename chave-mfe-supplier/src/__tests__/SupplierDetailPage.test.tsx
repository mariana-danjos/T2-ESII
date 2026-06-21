import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupplierDetailPage from '../pages/SupplierDetailPage';
import { SupplierApi } from '../api/client';

const supplier = {
  id: 'id1', legalName: 'Plus Fashion', tradeName: 'Plus', document: '11222333000181',
  documentType: 'cnpj' as const, email: 'a@b.com', phone: null, contactPerson: null,
  status: 'active' as const, address: { city: 'POA', state: 'RS' }, createdAt: '', updatedAt: '',
};

const product = {
  id: 'sp1', supplierId: 'id1', productId: 'prod-1', supplyPrice: 10,
  leadTimeDays: 5, supplierSku: 'SKU1', createdAt: '',
};

function makeApi(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    getSupplier: jest.fn().mockResolvedValue(supplier),
    listProducts: jest.fn().mockResolvedValue([]),
    listReplenishments: jest.fn().mockResolvedValue([]),
    linkProduct: jest.fn().mockResolvedValue(product),
    unlinkProduct: jest.fn().mockResolvedValue(undefined),
    createReplenishment: jest.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as SupplierApi;
}

it('loads and shows supplier detail with tabs', async () => {
  const api = makeApi();
  render(<SupplierDetailPage api={api} supplierId="id1" onBack={() => {}} onEdit={() => {}} />);
  await waitFor(() => expect(screen.getByText('Plus Fashion')).toBeInTheDocument());
  expect(screen.getByRole('tab', { name: /produtos/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /reposiç/i })).toBeInTheDocument();
});

it('shows error on load failure', async () => {
  const api = makeApi({ getSupplier: jest.fn().mockRejectedValue(new Error('Boom')) });
  render(<SupplierDetailPage api={api} supplierId="id1" onBack={() => {}} onEdit={() => {}} />);
  await waitFor(() => expect(screen.getByText(/Boom/)).toBeInTheDocument());
});

it('links a product via dialog and reloads', async () => {
  const api = makeApi();
  render(<SupplierDetailPage api={api} supplierId="id1" onBack={() => {}} onEdit={() => {}} />);
  await waitFor(() => screen.getByText('Plus Fashion'));
  await userEvent.click(screen.getByRole('tab', { name: /produtos/i }));
  await userEvent.click(screen.getByRole('button', { name: /vincular produto/i }));
  const dialog = screen.getByRole('dialog');
  await userEvent.type(within(dialog).getByLabelText(/ID do produto/i), 'prod-1');
  await userEvent.click(within(dialog).getByRole('button', { name: /vincular/i }));
  await waitFor(() => expect(api.linkProduct).toHaveBeenCalled());
  expect(api.getSupplier).toHaveBeenCalledTimes(2); // initial + reload
});

it('unlinks a product', async () => {
  const api = makeApi({ listProducts: jest.fn().mockResolvedValue([product]) });
  render(<SupplierDetailPage api={api} supplierId="id1" onBack={() => {}} onEdit={() => {}} />);
  await waitFor(() => screen.getByText('Plus Fashion'));
  await userEvent.click(screen.getByRole('tab', { name: /produtos/i }));
  await userEvent.click(screen.getByRole('button', { name: /desvincular/i }));
  await waitFor(() => expect(api.unlinkProduct).toHaveBeenCalledWith('id1', 'prod-1'));
});

it('registers a replenishment via dialog', async () => {
  const api = makeApi();
  render(<SupplierDetailPage api={api} supplierId="id1" onBack={() => {}} onEdit={() => {}} />);
  await waitFor(() => screen.getByText('Plus Fashion'));
  await userEvent.click(screen.getByRole('tab', { name: /reposiç/i }));
  await userEvent.click(screen.getByRole('button', { name: /registrar reposição/i }));
  const dialog = screen.getByRole('dialog');
  await userEvent.type(within(dialog).getAllByLabelText(/ID do produto/i)[0], 'prod-1');
  await userEvent.click(within(dialog).getByRole('button', { name: /^registrar$/i }));
  await waitFor(() => expect(api.createReplenishment).toHaveBeenCalled());
});
