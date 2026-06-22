"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
class SupplierService {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
    }
    async create(input) {
        const existing = await this.repo.findByDocument(input.document);
        if (existing)
            throw (0, errorHandler_1.conflict)('Já existe fornecedor com este documento');
        const supplier = await this.repo.create(input);
        await this.publisher.publish('supplier.created', supplier);
        return supplier;
    }
    async getById(id) {
        const supplier = await this.repo.findById(id);
        if (!supplier)
            throw (0, errorHandler_1.notFound)('Fornecedor não encontrado');
        return supplier;
    }
    async list(query) {
        return this.repo.list(query);
    }
    async update(id, input) {
        const updated = await this.repo.update(id, input);
        if (!updated)
            throw (0, errorHandler_1.notFound)('Fornecedor não encontrado');
        await this.publisher.publish('supplier.updated', updated);
        return updated;
    }
    async inactivate(id) {
        const updated = await this.repo.softDelete(id);
        if (!updated)
            throw (0, errorHandler_1.notFound)('Fornecedor não encontrado');
        await this.publisher.publish('supplier.inactivated', updated);
        return updated;
    }
}
exports.SupplierService = SupplierService;
//# sourceMappingURL=supplierService.js.map