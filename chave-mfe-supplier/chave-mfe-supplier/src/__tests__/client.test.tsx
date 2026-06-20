import { SupplierApi } from '../api/client';

describe('SupplierApi', () => {
  const fetchMock = jest.fn();
  beforeEach(() => { fetchMock.mockReset(); (global as { fetch: unknown }).fetch = fetchMock; localStorage.setItem('token', 'tkn'); });

  it('sends Authorization header and parses list', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [], page: 1, pageSize: 20, total: 0 }) });
    const api = new SupplierApi('http://api');
    const res = await api.listSuppliers({ page: 1, pageSize: 20 });
    expect(res.total).toBe(0);
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.headers.Authorization).toBe('Bearer tkn');
  });

  it('throws with server error message on non-ok', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: 'Documento duplicado' }) });
    const api = new SupplierApi('http://api');
    await expect(api.createSupplier({ legalName: 'x', document: '1', email: 'a@b.com' }))
      .rejects.toThrow('Documento duplicado');
  });
});
