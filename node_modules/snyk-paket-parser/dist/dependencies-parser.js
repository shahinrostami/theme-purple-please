"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_parser_1 = require("./line-parser");
const COMMENTS = ['#', '//'];
const GROUP = 'group';
const SOURCE = 'source';
// https://fsprojects.github.io/Paket/dependencies-file.html#Sources
const GITHUB = 'github';
const NUGET = 'nuget';
const CLITOOL = 'clitool';
const GIT = 'git';
const GIST = 'gist';
const HTTP = 'http';
function parseNuget(line) {
    const commentRegex = new RegExp(`(?:${COMMENTS[0]}|${COMMENTS[1]}).+`);
    const nameVersionOptionsRegex = new RegExp(/(\S+)\s*([^:\n]*)(:.*)?/);
    const versionFirstOptionRegex = new RegExp(/\s(?=[^ ]*$)/);
    const [, name, versionRangeAndFirstOption, restOptions] = line
        .replace(NUGET, '') // Remove 'nuget' string
        .replace(commentRegex, '') // Remove comments from line end
        .trim()
        .match(nameVersionOptionsRegex); // Split into groups for further parsing
    // nuget dependency result object to be returned
    const result = {
        source: NUGET,
        name,
        versionRange: versionRangeAndFirstOption,
        options: {},
    };
    if (restOptions) {
        // tslint:disable-next-line:prefer-const
        let [versionRange, firstOptionName] = versionRangeAndFirstOption.split(versionFirstOptionRegex);
        result.versionRange = versionRange;
        // If version is missing it will treat first option as version
        if (!firstOptionName) {
            result.versionRange = '';
            firstOptionName = versionRange;
        }
        result.options = `${firstOptionName}${restOptions}`
            .split(/\s*,\s*/) // Split by comma if there is couple possibilities for option (e.g. framework >= net40, net45)
            .reverse()
            .reduce((optionsMap, option, index, array) => {
            if (option.includes(':')) {
                const [optionKey, value] = option.split(/:\s*/);
                optionsMap[optionKey] = value;
            }
            else {
                array[index + 1] = `${array[index + 1]}, ${option}`;
            }
            return optionsMap;
        }, {});
    }
    return result;
}
// https://fsprojects.github.io/Paket/github-dependencies.html
function parseGithub(line) {
    const re = /"[^"]*"|\S+/g;
    const parts = line.match(re).splice(1);
    const [repo, version] = parts[0].split(':');
    return {
        file: parts[1] || '',
        repo,
        source: 'github',
        token: parts[2] || '',
        version: version || '',
    };
}
// https://fsprojects.github.io/Paket/nuget-dependencies.html#NuGet-feeds
function parseSource(line) {
    // Split URL and option string including possible comments.
    const urlRe = /^source ([^\s]+)(.*)$/i;
    const [, url, optionsString] = line.match(urlRe);
    // Options in this line is always double quoted.
    const options = {};
    const optionsRe = /(.*?)\W*:\W*"(.*?)"/g;
    const optionsStringTrimmed = optionsString.trim();
    let matches = optionsRe.exec(optionsStringTrimmed);
    while (matches) {
        options[matches[1].trim()] = matches[2].trim();
        matches = optionsRe.exec(optionsStringTrimmed);
    }
    return {
        options,
        url,
    };
}
function parseGroupOption(line) {
    // Line could be separated by space or by colon.
    // TODO: Think what to do with possible comment in the line.
    const result = line.match(/(\S+?)\s*(:|\s)\s*(.*)/);
    return [result[1] || '', result[3] || ''];
}
function parseDependenciesFile(input) {
    const lines = line_parser_1.parseLines(input);
    const result = [];
    let group = {
        dependencies: [],
        name: null,
        options: {},
        sources: [],
    };
    for (const line of lines) {
        const isComment = !!COMMENTS.find((comment) => line.data.startsWith(comment));
        // Ignore commented lines.
        if (isComment) {
            continue;
        }
        if (line.data.startsWith(`${GROUP} `)) {
            result.push(group);
            group = {
                dependencies: [],
                name: line.data.replace(GROUP, '').trim(),
                options: {},
                sources: [],
            };
        }
        else if (line.data.startsWith(`${SOURCE} `)) {
            group.sources.push(parseSource(line.data));
        }
        else if (line.data.startsWith(`${GITHUB} `)) {
            group.dependencies.push(parseGithub(line.data));
        }
        else if (line.data.startsWith(`${NUGET} `)) {
            group.dependencies.push(parseNuget(line.data));
        }
        else if (line.data.startsWith(`${CLITOOL} `)) {
            // TODO
        }
        else if (line.data.startsWith(`${GIT} `)) {
            // TODO
        }
        else if (line.data.startsWith(`${GIST} `)) {
            // TODO
        }
        else if (line.data.startsWith(`${HTTP} `)) {
            // TODO
        }
        else {
            const [name, value] = parseGroupOption(line.data);
            group.options[name] = value;
        }
    }
    result.push(group);
    return result;
}
exports.parseDependenciesFile = parseDependenciesFile;
//# sourceMappingURL=dependencies-parser.js.map