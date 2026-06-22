"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplenishmentController = void 0;
const schemas_1 = require("../validation/schemas");
class ReplenishmentController {
    constructor(service) {
        this.service = service;
        this.create = async (req, res, next) => {
            try {
                const input = schemas_1.createReplenishmentSchema.parse(req.body);
                res.status(201).json(await this.service.create(req.params.id, input));
            }
            catch (e) {
                next(e);
            }
        };
        this.list = async (req, res, next) => {
            try {
                const query = schemas_1.listReplenishmentsQuerySchema.parse(req.query);
                res.json(await this.service.listBySupplier(req.params.id, query));
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.ReplenishmentController = ReplenishmentController;
//# sourceMappingURL=replenishmentController.js.map