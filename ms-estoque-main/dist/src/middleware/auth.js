"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIdentity = extractIdentity;
exports.requireAuth = requireAuth;
exports.requireWrite = requireWrite;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const headerValue = (req, name) => {
    const v = req.headers[name.toLowerCase()];
    if (Array.isArray(v))
        return v[0] ?? null;
    return typeof v === 'string' ? v : null;
};
const parseRoles = (raw) => {
    if (!raw)
        return [];
    if (Array.isArray(raw))
        return raw.map(String);
    return raw.split(',').map((r) => r.trim()).filter(Boolean);
};
function extractIdentity(req) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
        try {
            const payload = jsonwebtoken_1.default.verify(auth.slice(7), env_1.env.jwtSecret);
            return {
                userId: payload.sub ?? null,
                email: payload.email ?? null,
                roles: parseRoles(payload[env_1.env.rbac.rolesClaim]),
            };
        }
        catch {
            return { userId: null, email: null, roles: [] };
        }
    }
    // Claims forwarded by API Gateway
    const userId = headerValue(req, env_1.env.rbac.userIdHeader);
    const email = headerValue(req, env_1.env.rbac.userEmailHeader);
    const roles = parseRoles(headerValue(req, env_1.env.rbac.rolesHeader));
    return { userId, email, roles };
}
function requireAuth(req, _res, next) {
    const id = extractIdentity(req);
    if (!id.userId && !id.email) {
        return next((0, errorHandler_1.unauthorized)());
    }
    req.identity = id;
    next();
}
function requireWrite(req, _res, next) {
    const id = req.identity ?? extractIdentity(req);
    req.identity = id;
    if (!id.userId && !id.email)
        return next((0, errorHandler_1.unauthorized)());
    if (id.roles.length === 0) {
        // Degrade gracefully: allow writes when no roles available unless enforcing
        if (env_1.env.rbac.enforce)
            return next((0, errorHandler_1.forbidden)('Roles ausentes; escrita requer admin/gestor'));
        return next();
    }
    if (id.roles.some((r) => env_1.WRITE_ROLES.includes(r)))
        return next();
    return next((0, errorHandler_1.forbidden)('Escrita requer perfil admin ou gestor'));
}
//# sourceMappingURL=auth.js.map