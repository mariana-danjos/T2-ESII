"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplenishmentService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
class ReplenishmentService {
    constructor(repo, supplierRepo, publisher) {
        this.repo = repo;
        this.supplierRepo = supplierRepo;
        this.publisher = publisher;
    }
    computeTotal(input) {
        const hasCosts = input.items.every((i) => typeof i.unitCost === 'number');
        if (!hasCosts)
            return null;
        return input.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    }
    async create(supplierId, input) {
        const supplier = await this.supplierRepo.findById(supplierId);
        if (!supplier)
            throw (0, errorHandler_1.notFound)('Fornecedor não encontrado');
        const total = this.computeTotal(input);
        const order = await this.repo.create(supplierId, input, total);
        await this.publisher.publish('replenishment.created', order);
        return order;
    }
    async listBySupplier(supplierId, query) {
        const supplier = await this.supplierRepo.findById(supplierId);
        if (!supplier)
            throw (0, errorHandler_1.notFound)('Fornecedor não encontrado');
        return this.repo.listBySupplier(supplierId, query);
    }
}
exports.ReplenishmentService = ReplenishmentService;
//# sourceMappingURL=replenishmentService.js.map