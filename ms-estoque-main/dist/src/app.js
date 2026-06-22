"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
// Browser clients (MFE/shell) are served from a different origin than this API, so
// the browser enforces CORS. Auth is carried in the Authorization header (no cookies),
// so a wildcard origin is safe; override with CORS_ORIGIN when locking it down.
function cors(req, res, next) {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS')
        return res.sendStatus(204);
    next();
}
function createApp(pool, publisher) {
    const app = (0, express_1.default)();
    app.use(cors);
    app.use(express_1.default.json());
    app.use((0, routes_1.buildRouter)(pool, publisher));
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map