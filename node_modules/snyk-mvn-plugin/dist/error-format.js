"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatGenericPluginError = void 0;
function formatGenericPluginError(error, mavenCommand, mvnArgs) {
    const fullCommand = [mavenCommand, ...mvnArgs].join(' ');
    const mvnwCommandTipMessage = 'Currently, you cannot run `mvnw` outside your current directory, you will have to go inside the directory of your project (see: https://github.com/takari/maven-wrapper/issues/133)\n\n';
    return (error.message +
        '\n\n' +
        'Please make sure that Apache Maven Dependency Plugin ' +
        'version 2.2 or above is installed, and that `' +
        fullCommand +
        '` executes successfully ' +
        'on this project.\n\n' +
        (mavenCommand.indexOf('mvnw') >= 0 ? mvnwCommandTipMessage : '') +
        'If the problem persists, collect the output of `' +
        fullCommand +
        '` and contact support@snyk.io\n');
}
exports.formatGenericPluginError = formatGenericPluginError;
//# sourceMappingURL=error-format.js.map