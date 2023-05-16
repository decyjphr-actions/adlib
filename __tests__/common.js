"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repository = exports.cleanAll = exports.teardownNock = exports.initializeNock = void 0;
const nock_1 = __importDefault(require("nock"));
//const settings = require('../../lib/settings')
nock_1.default.disableNetConnect();
const repository = {
    default_branch: 'main',
    name: 'decyjphr-ado-migration2',
    owner: {
        name: 'decyjphr-org',
        email: null
    }
};
exports.repository = repository;
function initializeNock() {
    nock_1.default.disableNetConnect();
    return (0, nock_1.default)('https://api.github.com');
}
exports.initializeNock = initializeNock;
function teardownNock(githubScope) {
    expect(githubScope.isDone()).toBe(true);
    nock_1.default.cleanAll();
}
exports.teardownNock = teardownNock;
function cleanAll() {
    nock_1.default.cleanAll();
}
exports.cleanAll = cleanAll;
