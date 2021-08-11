"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCommandResult = exports.CommandResult = void 0;
class CommandResult {
    constructor(result) {
        this.result = result;
    }
    toString() {
        return this.result;
    }
    getDisplayResults() {
        return this.result;
    }
}
exports.CommandResult = CommandResult;
class TestCommandResult extends CommandResult {
    constructor() {
        super(...arguments);
        this.jsonResult = '';
        this.sarifResult = '';
    }
    getJsonResult() {
        return this.jsonResult;
    }
    getSarifResult() {
        return this.sarifResult;
    }
    static createHumanReadableTestCommandResult(humanReadableResult, jsonResult, sarifResult) {
        return new HumanReadableTestCommandResult(humanReadableResult, jsonResult, sarifResult);
    }
    static createJsonTestCommandResult(stdout, jsonResult, sarifResult) {
        return new JsonTestCommandResult(stdout, jsonResult, sarifResult);
    }
}
exports.TestCommandResult = TestCommandResult;
class HumanReadableTestCommandResult extends TestCommandResult {
    constructor(humanReadableResult, jsonResult, sarifResult) {
        super(humanReadableResult);
        this.jsonResult = '';
        this.sarifResult = '';
        this.jsonResult = jsonResult;
        if (sarifResult) {
            this.sarifResult = sarifResult;
        }
    }
    getJsonResult() {
        return this.jsonResult;
    }
    getSarifResult() {
        return this.sarifResult;
    }
}
class JsonTestCommandResult extends TestCommandResult {
    constructor(stdout, jsonResult, sarifResult) {
        super(stdout);
        if (jsonResult) {
            this.jsonResult = jsonResult;
        }
        if (sarifResult) {
            this.sarifResult = sarifResult;
        }
        else {
            this.jsonResult = stdout;
        }
    }
    getJsonResult() {
        return this.jsonResult;
    }
    getSarifResult() {
        return this.sarifResult;
    }
}
//# sourceMappingURL=types.js.map