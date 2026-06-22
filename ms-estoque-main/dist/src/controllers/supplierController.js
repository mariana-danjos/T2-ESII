"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const schemas_1 = require("../validation/schemas");
class SupplierController {
    constructor(service) {
        this.service = service;
        this.create = async (req, res, next) => {
            try {
                const input = schemas_1.createSupplierSchema.parse(req.body);
                const supplier = await this.service.create(input);
                res.status(201).json(supplier);
            }
            catch (e) {
                next(e);
            }
        };
        this.list = async (req, res, next) => {
            try {
                const query = schemas_1.listSuppliersQuerySchema.parse(req.query);
                res.json(await this.service.list(query));
            }
            catch (e) {
                next(e);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                res.json(await this.service.getById(req.params.id));
            }
            catch (e) {
                next(e);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const input = schemas_1.updateSupplierSchema.parse(req.body);
                res.json(await this.service.update(req.params.id, input));
            }
            catch (e) {
                next(e);
            }
        };
        this.remove = async (req, res, next) => {
            try {
                res.json(await this.service.inactivate(req.params.id));
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.SupplierController = SupplierController;
//# sourceMappingURL=supplierController.js.map