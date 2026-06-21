import { SupplierProductRepository } from '../supplierProductRepository';

const row = {
  id: 'sp1', supplier_id: 'sup1', product_id: 'prod1',
  supply_price: '49.90', lead_time_days: 7, supplier_sku: 'SKU-001',
  created_at: '2026-01-01T00:00:00Z',
};

describe('SupplierProductRepository.link', () => {
  it('returns mapped supplier product', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [row], rowCount: 1 }) };
    const repo = new SupplierProductRepository(pool as never);
    const result = await repo.link('sup1', { productId: 'prod1', supplyPrice: 49.90, leadTimeDays: 7, supplierSku: 'SKU-001' });
    expect(result.supplierId).toBe('sup1');
    expect(result.productId).toBe('prod1');
    expect(result.supplyPrice).toBe(49.90);
  });

  it('handles null optional fields', async () => {
    const nullRow = { ...row, supply_price: null, lead_time_days: null, supplier_sku: null };
    const pool = { query: jest.fn().mockResolvedValue({ rows: [nullRow], rowCount: 1 }) };
    const repo = new SupplierProductRepository(pool as never);
    const result = await repo.link('sup1', { productId: 'prod1' });
    expect(result.supplyPrice).toBeNull();
    expect(result.leadTimeDays).toBeNull();
    expect(result.supplierSku).toBeNull();
  });
});

describe('SupplierProductRepository.unlink', () => {
  it('returns true when row deleted', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 1 }) };
    const repo = new SupplierProductRepository(pool as never);
    expect(await repo.unlink('sup1', 'prod1')).toBe(true);
  });

  it('returns false when nothing deleted', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) };
    const repo = new SupplierProductRepository(pool as never);
    expect(await repo.unlink('sup1', 'missing')).toBe(false);
  });
});

describe('SupplierProductRepository.listBySupplier', () => {
  it('returns empty array when none found', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) };
    const repo = new SupplierProductRepository(pool as never);
    expect(await repo.listBySupplier('sup1')).toEqual([]);
  });

  it('returns mapped list', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [row], rowCount: 1 }) };
    const repo = new SupplierProductRepository(pool as never);
    const result = await repo.listBySupplier('sup1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('sp1');
  });
});

describe('SupplierProductRepository.listByProduct', () => {
  it('returns mapped list', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [row], rowCount: 1 }) };
    const repo = new SupplierProductRepository(pool as never);
    const result = await repo.listByProduct('prod1');
    expect(result[0].productId).toBe('prod1');
  });
});
