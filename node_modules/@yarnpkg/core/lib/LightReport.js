"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightReport = void 0;
const tslib_1 = require("tslib");
const Report_1 = require("./Report");
const StreamReport_1 = require("./StreamReport");
const formatUtils = tslib_1.__importStar(require("./formatUtils"));
class LightReport extends Report_1.Report {
    constructor({ configuration, stdout, suggestInstall = true }) {
        super();
        this.errorCount = 0;
        formatUtils.addLogFilterSupport(this, { configuration });
        this.configuration = configuration;
        this.stdout = stdout;
        this.suggestInstall = suggestInstall;
    }
    static async start(opts, cb) {
        const report = new this(opts);
        try {
            await cb(report);
        }
        catch (error) {
            report.reportExceptionOnce(error);
        }
        finally {
            await report.finalize();
        }
        return report;
    }
    hasErrors() {
        return this.errorCount > 0;
    }
    exitCode() {
        return this.hasErrors() ? 1 : 0;
    }
    reportCacheHit(locator) {
    }
    reportCacheMiss(locator) {
    }
    startTimerSync(what, opts, cb) {
        const realCb = typeof opts === `function` ? opts : cb;
        return realCb();
    }
    async startTimerPromise(what, opts, cb) {
        const realCb = typeof opts === `function` ? opts : cb;
        return await realCb();
    }
    async startCacheReport(cb) {
        return await cb();
    }
    reportSeparator() {
    }
    reportInfo(name, text) {
    }
    reportWarning(name, text) {
    }
    reportError(name, text) {
        this.errorCount += 1;
        this.stdout.write(`${formatUtils.pretty(this.configuration, `➤`, `redBright`)} ${this.formatNameWithHyperlink(name)}: ${text}\n`);
    }
    reportProgress(progress) {
        const promise = Promise.resolve().then(async () => {
            // eslint-disable-next-line no-empty-pattern
            for await (const {} of progress) {
                // No need to do anything; we just want to consume the progress events
            }
        });
        const stop = () => {
            // Nothing to stop
        };
        return { ...promise, stop };
    }
    reportJson(data) {
        // Just ignore the json output
    }
    async finalize() {
        if (this.errorCount > 0) {
            this.stdout.write(`${formatUtils.pretty(this.configuration, `➤`, `redBright`)} Errors happened when preparing the environment required to run this command.\n`);
            if (this.suggestInstall) {
                this.stdout.write(`${formatUtils.pretty(this.configuration, `➤`, `redBright`)} This might be caused by packages being missing from the lockfile, in which case running "yarn install" might help.\n`);
            }
        }
    }
    formatNameWithHyperlink(name) {
        return StreamReport_1.formatNameWithHyperlink(name, {
            configuration: this.configuration,
            json: false,
        });
    }
}
exports.LightReport = LightReport;
