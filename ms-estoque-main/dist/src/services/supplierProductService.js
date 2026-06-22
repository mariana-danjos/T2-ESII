"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierProductService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
class SupplierProductService {
    constructor(repo, supplierRepo, publisher) {
        this.repo = repo;
        this.supplierRepo = supplierRepo;
        this.publisher = publisher;
    }
    async ensureSupplier(supplierId) {
        const s = await this.supplierRepo.findById(supplierId);
        if (!s)
            throw (0, errorHandler_1.notFound)('Fornecedor não encontrado');
    }
    async link(supplierId, input) {
        await this.ensureSupplier(supplierId);
        const link = await this.repo.link(supplierId, input);
        await this.publisher.publish('supplier.product.linked', link);
        return link;
    }
    async unlink(supplierId, productId) {
        await this.ensureSupplier(supplierId);
        const removed = await this.repo.unlink(supplierId, productId);
        if (!removed)
            throw (0, errorHandler_1.notFound)('Vínculo não encontrado');
    }
    async listBySupplier(supplierId) {
        await this.ensureSupplier(supplierId);
        return this.repo.listBySupplier(supplierId);
    }
    async listByProduct(productId) {
        return this.repo.listByProduct(productId);
    }
}
exports.SupplierProductService = SupplierProductService;
//# sourceMappingURL=supplierProductService.js.map