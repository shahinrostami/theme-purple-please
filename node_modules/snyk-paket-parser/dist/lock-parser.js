"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_parser_1 = require("./line-parser");
const REPOSITORY_TYPES = ['HTTP', 'GIST', 'GIT', 'NUGET', 'GITHUB']; // naming convention in paket's standard parser
const GROUP = 'GROUP';
const REMOTE = 'REMOTE';
const SPECS = 'SPECS';
function parseOptions(optionsString) {
    const options = {};
    for (const option of optionsString.split(/, +/)) {
        const optionParts = option.split(/: +/);
        if (optionParts[0] !== '') {
            options[optionParts[0]] = optionParts[1];
        }
    }
    return options;
}
function parseDependencyLine(line, isSubDependency) {
    const re = /^([^ ]+)\W+\(([^)]+)\)\W*(.*)$/;
    const match = line.data.match(re);
    const result = {
        name: '',
        version: '',
        options: {},
    };
    if (!match && !isSubDependency) {
        throw new Error(`Malformed paket.lock file: Missing resolved version on ${line.data}`);
    }
    //    Octokit (0.10.0)
    //      Microsoft.Net.Http
    // For this case where there is no version in the transitive,
    // we are not yet sure it is valid but want to retain the data.
    if (!match) {
        result.name = line.data;
    }
    else {
        result.name = match[1];
        result.version = match[2];
        result.options = parseOptions(match[3]);
    }
    if (!isSubDependency) {
        result.dependencies = [];
    }
    return result;
}
function parseLockFile(input) {
    const result = {
        groups: [],
    };
    const lines = line_parser_1.parseLines(input);
    let group = {
        name: null,
        repositories: {},
        dependencies: [],
    };
    let depContext = {};
    let dependency = null;
    for (const line of lines) {
        const upperCaseLine = line.data.toUpperCase();
        if (line.indentation === 0) { // group or group option
            if (upperCaseLine.startsWith(GROUP)) {
                result.groups.push(group);
                depContext = {};
                group = {
                    name: line.data.substr(GROUP.length).trim(),
                    repositories: {},
                    dependencies: [],
                };
            }
            else if (REPOSITORY_TYPES.indexOf(upperCaseLine) !== -1) {
                depContext.repository = line.data;
                group.repositories[line.data] = [];
            }
            else {
                const [optionName, optionValue] = line.data.split(':');
                group.options = group.options || {};
                // TODO: keeping null option values to know the option names
                // need to decide what to do with them
                group.options[optionName.trim()] = optionValue ? optionValue.trim() : null;
            }
        }
        else if (line.indentation === 1) { // remote or specs
            if (upperCaseLine.startsWith(REMOTE)) {
                const remote = line.data.substring(REMOTE.length + ':'.length).trim();
                if (remote) {
                    depContext.remote = remote;
                    group.repositories[depContext.repository].push(remote);
                }
            }
            else if (upperCaseLine.startsWith(SPECS)) {
                // TODO: for now we add the specs as boolean in meta
                group.specs = true;
            }
        }
        else {
            const dep = parseDependencyLine(line, line.indentation === 3);
            if (line.indentation === 2) { // Resolved Dependency
                dep.remote = depContext.remote;
                dep.repository = depContext.repository;
                dependency = dep;
            }
            else { // Transitive Dependency
                dependency.dependencies.push(dep);
            }
        }
        if (group && dependency && group.dependencies.indexOf(dependency) === -1) {
            group.dependencies.push(dependency);
        }
    }
    result.groups.push(group);
    return result;
}
exports.parseLockFile = parseLockFile;
//# sourceMappingURL=lock-parser.js.map