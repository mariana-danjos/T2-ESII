"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopPublisher = void 0;
class NoopPublisher {
    constructor() {
        this.published = [];
    }
    async publish(type, payload) {
        this.published.push({ type, payload });
    }
}
exports.NoopPublisher = NoopPublisher;
//# sourceMappingURL=publisher.js.map