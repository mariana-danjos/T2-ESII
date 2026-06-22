"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const pool_1 = require("./db/pool");
const snsPublisher_1 = require("./messaging/snsPublisher");
const env_1 = require("./config/env");
const app = (0, app_1.createApp)(pool_1.pool, (0, snsPublisher_1.buildPublisher)());
app.listen(env_1.env.port, () => console.log(`chave-ms-supplier rodando na porta ${env_1.env.port}`));
//# sourceMappingURL=index.js.map