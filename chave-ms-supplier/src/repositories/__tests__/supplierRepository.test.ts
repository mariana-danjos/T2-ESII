import { SupplierRepository } from '../supplierRepository';

const row = {
  id: 'id1', legal_name: 'Plus', trade_name: null, document: '11222333000181',
  document_type: 'cnpj', email: 'a@b.com', phone: null, contact_person: null,
  status: 'active', address_street: null, address_number: null, address_complement: null,
  address_district: null, address_city: 'POA', address_state: 'RS', address_zip_code: null,
  address_country: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
};

describe('SupplierRepository.findById', () => {
  it('maps row to entity', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [row], rowCount: 1 }) };
    const repo = new SupplierRepository(pool as never);
    const result = await repo.findById('id1');
    expect(result?.legalName).toBe('Plus');
    expect(result?.address.city).toBe('POA');
    expect(result?.documentType).toBe('cnpj');
  });

  it('returns null when not found', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) };
    const repo = new SupplierRepository(pool as never);
    expect(await repo.findById('x')).toBeNull();
  });
});

describe('SupplierRepository.list with q + status filter', () => {
  it('generates correct param count and returns mapped page', async () => {
    // With status + q: params = [status, %q%, %q%, %q%] → 4 params for WHERE
    // Then LIMIT ($5) and OFFSET ($6) appended for data query
    const countRow = { total: 2 };
    const dataRows = [row];
    const pool = {
      query: jest.fn()
        // first call = count query
        .mockResolvedValueOnce({ rows: [countRow], rowCount: 1 })
        // second call = data query
        .mockResolvedValueOnce({ rows: dataRows, rowCount: 1 }),
    };
    const repo = new SupplierRepository(pool as never);
    const result = await repo.list({ page: 1, pageSize: 20, status: 'active', q: 'Plus' });

    const calls = (pool.query as jest.Mock).mock.calls;
    // count query params: [status, %q%, %q%, %q%] → length 4
    expect(calls[0][1]).toHaveLength(4);
    expect(calls[0][1][0]).toBe('active');
    expect(calls[0][1][1]).toBe('%Plus%');
    expect(calls[0][1][2]).toBe('%Plus%');
    expect(calls[0][1][3]).toBe('%Plus%');

    // data query params: same 4 + pageSize + offset → length 6
    expect(calls[1][1]).toHaveLength(6);
    expect(calls[1][1][4]).toBe(20);  // pageSize
    expect(calls[1][1][5]).toBe(0);   // offset = (1-1)*20

    // SQL placeholders must align: $1=status, $2/$3/$4=q wildcards, $5=LIMIT, $6=OFFSET
    const dataSql: string = calls[1][0];
    expect(dataSql).toContain('$1');
    expect(dataSql).toContain('$2');
    expect(dataSql).toContain('$3');
    expect(dataSql).toContain('$4');
    expect(dataSql).toContain('LIMIT $5');
    expect(dataSql).toContain('OFFSET $6');

    expect(result.total).toBe(2);
    expect(result.data[0].legalName).toBe('Plus');
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('applies city, state and productId filters', async () => {
    const pool = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: [{ total: 1 }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [row], rowCount: 1 }),
    };
    const repo = new SupplierRepository(pool as never);
    const result = await repo.list({ page: 2, pageSize: 10, city: 'POA', state: 'RS', productId: 'prod-1' });

    const calls = (pool.query as jest.Mock).mock.calls;
    const countSql: string = calls[0][0];
    expect(countSql).toContain('address_city ILIKE');
    expect(countSql).toContain('address_state =');
    expect(countSql).toContain('supplier_products');
    // page 2, pageSize 10 → offset = 10
    expect(calls[1][1].at(-1)).toBe(10);
    expect(result.page).toBe(2);
  });
});

describe('SupplierRepository.softDelete', () => {
  it('returns updated supplier on success', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [row], rowCount: 1 }) };
    const repo = new SupplierRepository(pool as never);
    const result = await repo.softDelete('id1');
    expect(result?.status).toBe('active');
  });

  it('returns null when supplier not found', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) };
    const repo = new SupplierRepository(pool as never);
    expect(await repo.softDelete('missing')).toBeNull();
  });
});

describe('SupplierRepository.update', () => {
  it('returns null when supplier not found', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) };
    const repo = new SupplierRepository(pool as never);
    expect(await repo.update('missing', {})).toBeNull();
  });

  it('returns updated supplier', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [row], rowCount: 1 }) };
    const repo = new SupplierRepository(pool as never);
    const result = await repo.update('id1', { email: 'new@b.com' });
    expect(result?.id).toBe('id1');
  });
});

describe('SupplierRepository.findByDocument', () => {
  it('returns null when not found', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) };
    const repo = new SupplierRepository(pool as never);
    expect(await repo.findByDocument('00000000000000')).toBeNull();
  });
});
