"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unauthorized = exports.forbidden = exports.conflict = exports.notFound = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}
exports.AppError = AppError;
const notFound = (msg = 'Recurso não encontrado') => new AppError(404, msg);
exports.notFound = notFound;
const conflict = (msg) => new AppError(409, msg);
exports.conflict = conflict;
const forbidden = (msg = 'Acesso negado') => new AppError(403, msg);
exports.forbidden = forbidden;
const unauthorized = (msg = 'Não autenticado') => new AppError(401, msg);
exports.unauthorized = unauthorized;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: err.flatten() });
    }
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message, details: err.details });
    }
    // Unique violation from Postgres
    if (typeof err === 'object' && err !== null && err.code === '23505') {
        return res.status(409).json({ error: 'Registro duplicado' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
}
//# sourceMappingURL=errorHandler.js.map