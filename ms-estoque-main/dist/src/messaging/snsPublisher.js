"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnsPublisher = void 0;
exports.buildPublisher = buildPublisher;
const client_sns_1 = require("@aws-sdk/client-sns");
const env_1 = require("../config/env");
const publisher_1 = require("./publisher");
class SnsPublisher {
    constructor(topicArn) {
        this.topicArn = topicArn;
        this.client = new client_sns_1.SNSClient({
            region: env_1.env.events.region,
            endpoint: env_1.env.events.awsEndpoint,
        });
    }
    async publish(type, payload) {
        await this.client.send(new client_sns_1.PublishCommand({
            TopicArn: this.topicArn,
            Message: JSON.stringify(payload),
            MessageAttributes: { type: { DataType: 'String', StringValue: type } },
        }));
    }
}
exports.SnsPublisher = SnsPublisher;
function buildPublisher() {
    if (env_1.env.events.enabled && env_1.env.events.snsTopicArn) {
        return new SnsPublisher(env_1.env.events.snsTopicArn);
    }
    // disabled or unconfigured → noop
    return new publisher_1.NoopPublisher();
}
//# sourceMappingURL=snsPublisher.js.map