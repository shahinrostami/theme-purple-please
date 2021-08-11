"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.parsePackageString = void 0;
const debug = require('debug')('snyk:module');
const gitHost = require("hosted-git-info");
exports.default = parsePackageString;
/**
 * Parses a string package id (name + optional version) to an object.
 *
 * This method used to be named `moduleToObject`.
 */
function parsePackageString(nameAndMaybeVersion, versionOrOptions, options) {
    if (!nameAndMaybeVersion) {
        throw new Error('requires string to parse into module');
    }
    let version;
    if (versionOrOptions && !options && typeof versionOrOptions === 'object') {
        options = versionOrOptions;
    }
    else {
        version = versionOrOptions;
    }
    let str = nameAndMaybeVersion;
    // first, try the common case; there's no version, and it's a normal package name
    if (!version) {
        // foo, foo-bar, @foo/bar, com.example:test
        // none of these can be URLs, or versions
        const fastPath = /^(?:(?:[a-z-]+)|(?:@[a-z-]+\/[a-z-]+)|(?:[a-z-]+\.[.a-z-]+:[a-z-]+))$/;
        if (fastPath.test(str)) {
            return supported(str, { name: str, version: '*' }, options);
        }
    }
    if (version && str.lastIndexOf('@') < 1) {
        debug('appending version onto string');
        str += '@' + version;
    }
    // first try with regular git urls
    const gitObject = looksLikeUrl(str);
    if (gitObject) {
        // then the string looks like a url, let's try to parse it
        return supported(str, fromGitObject(gitObject), options);
    }
    let parts = str.split('@');
    if (str.indexOf('@') === 0) {
        // put the scoped package name back together
        parts = parts.slice(1);
        parts[0] = '@' + parts[0];
    }
    // then as a backup, try pkg@giturl
    const maybeGitObject = parts[1] && looksLikeUrl(parts[1]);
    if (maybeGitObject) {
        // then the string looks like a url, let's try to parse it
        return supported(str, fromGitObject(maybeGitObject), options);
    }
    if (parts.length === 1) {
        // no version
        parts.push('*');
    }
    const module = {
        name: parts[0],
        version: parts.slice(1).join('@'),
    };
    return supported(str, module, options);
}
exports.parsePackageString = parsePackageString;
// git host from URL
function looksLikeUrl(str) {
    if (str.slice(-1) === '/') {
        // strip the trailing slash since we can't parse it properly anyway
        str = str.slice(0, -1);
    }
    if (str.toLowerCase().indexOf('://github.com/') !== -1 &&
        str.indexOf('http') === 0) {
        // attempt to get better compat with our parser by stripping the github
        // and url parts
        // examples:
        // - https://github.com/Snyk/snyk/releases/tag/v1.14.2
        // - https://github.com/Snyk/vulndb/tree/snapshots
        // - https://github.com/Snyk/snyk/commit/75477b18
        const parts = str.replace(/https?:\/\/github.com\//, '').split('/');
        str = parts.shift() + '/' + parts.shift();
        if (parts.length) {
            str += '#' + parts.pop();
        }
    }
    const obj = gitHost.fromUrl(str);
    return obj;
}
function fromGitObject(obj) {
    // debug('parsed from hosted-git-info');
    /* istanbul ignore if */
    if (!obj.project || !obj.user) {
        // this should never actually occur
        const error = new Error('not supported: failed to fully parse');
        error.code = 501;
        throw error;
    }
    const module = {
        name: obj.project,
        version: obj.user + '/' + obj.project,
    };
    if (obj.committish) {
        module.version += '#' + obj.committish;
    }
    return module;
}
function encode(name) {
    return name[0] + encodeURIComponent(name.slice(1));
}
exports.encode = encode;
function supported(str, module, options) {
    if (!options) {
        options = {};
    }
    if (options.packageManager === 'maven') {
        if (str.indexOf(':') === -1) {
            throw new Error('invalid Maven package name: ' + str);
        }
        return module;
    }
    const protocolMatch = module.version.match(/^(https?:)|(git[:+])/i);
    if (protocolMatch || module.name.indexOf('://') !== -1) {
        // we don't support non-npm modules atm
        debug('not supported %s@%s (ext)', module.name, module.version);
        if (options.loose) {
            delete module.version;
        }
        else {
            debug('external module: ' + toString(module));
        }
    }
    if (module.version === 'latest' || !module.version) {
        module.version = '*';
    }
    debug('%s => { name: "%s", version: "%s" }', str, module.name, module.version);
    return module;
}
function toString(module) {
    return module.name + '@' + module.version;
}
//# sourceMappingURL=index.js.map