"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierProductController = void 0;
const schemas_1 = require("../validation/schemas");
class SupplierProductController {
    constructor(service) {
        this.service = service;
        this.link = async (req, res, next) => {
            try {
                const input = schemas_1.linkProductSchema.parse(req.body);
                res.status(201).json(await this.service.link(req.params.id, input));
            }
            catch (e) {
                next(e);
            }
        };
        this.unlink = async (req, res, next) => {
            try {
                await this.service.unlink(req.params.id, req.params.productId);
                res.status(204).send();
            }
            catch (e) {
                next(e);
            }
        };
        this.listBySupplier = async (req, res, next) => {
            try {
                res.json(await this.service.listBySupplier(req.params.id));
            }
            catch (e) {
                next(e);
            }
        };
        this.listByProduct = async (req, res, next) => {
            try {
                res.json(await this.service.listByProduct(req.params.productId));
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.SupplierProductController = SupplierProductController;
//# sourceMappingURL=supplierProductController.js.map