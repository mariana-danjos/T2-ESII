"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReplenishmentsQuerySchema = exports.createReplenishmentSchema = exports.linkProductSchema = exports.listSuppliersQuerySchema = exports.updateSupplierSchema = exports.createSupplierSchema = void 0;
const zod_1 = require("zod");
const document_1 = require("./document");
const addressSchema = zod_1.z.object({
    street: zod_1.z.string().max(255).optional().nullable(),
    number: zod_1.z.string().max(20).optional().nullable(),
    complement: zod_1.z.string().max(255).optional().nullable(),
    district: zod_1.z.string().max(120).optional().nullable(),
    city: zod_1.z.string().max(120).optional().nullable(),
    state: zod_1.z.string().max(60).optional().nullable(),
    zipCode: zod_1.z.string().max(20).optional().nullable(),
    country: zod_1.z.string().max(60).optional().nullable(),
}).partial();
const documentField = zod_1.z.string().transform((v) => (0, document_1.onlyDigits)(v)).refine((v) => (0, document_1.classifyDocument)(v) !== null, { message: 'documento inválido (CPF ou CNPJ)' });
exports.createSupplierSchema = zod_1.z.object({
    legalName: zod_1.z.string().min(1).max(255),
    tradeName: zod_1.z.string().max(255).optional().nullable(),
    document: documentField,
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().max(40).optional().nullable(),
    contactPerson: zod_1.z.string().max(255).optional().nullable(),
    address: addressSchema.optional(),
}).transform((data) => ({
    ...data,
    documentType: (0, document_1.classifyDocument)(data.document),
}));
exports.updateSupplierSchema = zod_1.z.object({
    legalName: zod_1.z.string().min(1).max(255).optional(),
    tradeName: zod_1.z.string().max(255).optional().nullable(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(40).optional().nullable(),
    contactPerson: zod_1.z.string().max(255).optional().nullable(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    address: addressSchema.optional(),
});
exports.listSuppliersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    productId: zod_1.z.string().optional(),
    q: zod_1.z.string().optional(),
});
exports.linkProductSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    supplyPrice: zod_1.z.number().nonnegative().optional().nullable(),
    leadTimeDays: zod_1.z.number().int().nonnegative().optional().nullable(),
    supplierSku: zod_1.z.string().max(120).optional().nullable(),
});
exports.createReplenishmentSchema = zod_1.z.object({
    status: zod_1.z.enum(['requested', 'sent', 'received', 'cancelled']).default('requested'),
    orderedAt: zod_1.z.string().datetime().optional(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        quantity: zod_1.z.number().int().positive(),
        unitCost: zod_1.z.number().nonnegative().optional().nullable(),
    })).min(1),
});
exports.listReplenishmentsQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['requested', 'sent', 'received', 'cancelled']).optional(),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=schemas.js.map