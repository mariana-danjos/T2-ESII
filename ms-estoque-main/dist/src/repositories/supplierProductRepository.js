"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierProductRepository = void 0;
const map = (r) => ({
    id: r.id, supplierId: r.supplier_id, productId: r.product_id,
    supplyPrice: r.supply_price === null ? null : Number(r.supply_price),
    leadTimeDays: r.lead_time_days, supplierSku: r.supplier_sku,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
});
class SupplierProductRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async link(supplierId, input) {
        const { rows } = await this.pool.query(`INSERT INTO supplier_products (supplier_id, product_id, supply_price, lead_time_days, supplier_sku)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`, [supplierId, input.productId, input.supplyPrice ?? null, input.leadTimeDays ?? null, input.supplierSku ?? null]);
        return map(rows[0]);
    }
    async unlink(supplierId, productId) {
        const { rowCount } = await this.pool.query('DELETE FROM supplier_products WHERE supplier_id = $1 AND product_id = $2', [supplierId, productId]);
        return (rowCount ?? 0) > 0;
    }
    async listBySupplier(supplierId) {
        const { rows } = await this.pool.query('SELECT * FROM supplier_products WHERE supplier_id = $1 ORDER BY created_at DESC', [supplierId]);
        return rows.map(map);
    }
    async listByProduct(productId) {
        const { rows } = await this.pool.query('SELECT * FROM supplier_products WHERE product_id = $1 ORDER BY created_at DESC', [productId]);
        return rows.map(map);
    }
}
exports.SupplierProductRepository = SupplierProductRepository;
//# sourceMappingURL=supplierProductRepository.js.map