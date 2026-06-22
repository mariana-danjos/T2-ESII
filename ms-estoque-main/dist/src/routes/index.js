"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRouter = buildRouter;
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const supplierRepository_1 = require("../repositories/supplierRepository");
const supplierProductRepository_1 = require("../repositories/supplierProductRepository");
const replenishmentRepository_1 = require("../repositories/replenishmentRepository");
const supplierService_1 = require("../services/supplierService");
const supplierProductService_1 = require("../services/supplierProductService");
const replenishmentService_1 = require("../services/replenishmentService");
const supplierController_1 = require("../controllers/supplierController");
const supplierProductController_1 = require("../controllers/supplierProductController");
const replenishmentController_1 = require("../controllers/replenishmentController");
const auth_1 = require("../middleware/auth");
function buildRouter(pool, publisher) {
    const supplierRepo = new supplierRepository_1.SupplierRepository(pool);
    const productRepo = new supplierProductRepository_1.SupplierProductRepository(pool);
    const repRepo = new replenishmentRepository_1.ReplenishmentRepository(pool);
    const supplier = new supplierController_1.SupplierController(new supplierService_1.SupplierService(supplierRepo, publisher));
    const product = new supplierProductController_1.SupplierProductController(new supplierProductService_1.SupplierProductService(productRepo, supplierRepo, publisher));
    const replenishment = new replenishmentController_1.ReplenishmentController(new replenishmentService_1.ReplenishmentService(repRepo, supplierRepo, publisher));
    const router = (0, express_1.Router)();
    const openapiPath = path_1.default.resolve(__dirname, '../../../openapi.yaml');
    router.get('/health', (_req, res) => res.json({ status: 'ok' }));
    router.get('/openapi.yaml', (_req, res) => res.sendFile(openapiPath));
    router.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(undefined, {
        swaggerOptions: { url: '/openapi.yaml' },
    }));
    // Suppliers
    router.post('/suppliers', auth_1.requireAuth, auth_1.requireWrite, supplier.create);
    router.get('/suppliers', auth_1.requireAuth, supplier.list);
    router.get('/suppliers/:id', auth_1.requireAuth, supplier.getById);
    router.put('/suppliers/:id', auth_1.requireAuth, auth_1.requireWrite, supplier.update);
    router.patch('/suppliers/:id', auth_1.requireAuth, auth_1.requireWrite, supplier.update);
    router.delete('/suppliers/:id', auth_1.requireAuth, auth_1.requireWrite, supplier.remove);
    // Supplier ↔ products
    router.post('/suppliers/:id/products', auth_1.requireAuth, auth_1.requireWrite, product.link);
    router.get('/suppliers/:id/products', auth_1.requireAuth, product.listBySupplier);
    router.delete('/suppliers/:id/products/:productId', auth_1.requireAuth, auth_1.requireWrite, product.unlink);
    router.get('/products/:productId/suppliers', auth_1.requireAuth, product.listByProduct);
    // Replenishments
    router.post('/suppliers/:id/replenishments', auth_1.requireAuth, auth_1.requireWrite, replenishment.create);
    router.get('/suppliers/:id/replenishments', auth_1.requireAuth, replenishment.list);
    return router;
}
//# sourceMappingURL=index.js.map