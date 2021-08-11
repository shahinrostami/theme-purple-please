"use strict";
/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const lockfile = __importStar(require("@yarnpkg/lockfile"));
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
const commander_1 = __importDefault(require("commander"));
/**
 * Flatten a nested array one level.
 */
function flat(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}
/**
 * Parse the yarn file at the given path.
 */
function readYarn(basePath = '.') {
    const file = fs.readFileSync(path.join(basePath, 'yarn.lock'), 'utf8');
    const json = lockfile.parse(file);
    if (json.type !== 'success') {
        throw new Error('Error reading file');
    }
    return json.object;
}
/**
 * Get a node name corresponding to package@versionspec.
 *
 * The nodes names are of the form "<package>@<resolved version>".
 *
 * Returns undefined if the package is not fund
 */
function getNode(yarnData, pkgName) {
    if (!(pkgName in yarnData)) {
        console.error(`Could not find ${pkgName} in yarn.lock file. Ignore if this is a top-level package.`);
        return undefined;
    }
    const name = pkgName[0] + pkgName.slice(1).split('@')[0];
    const version = yarnData[pkgName].version;
    const pkgNode = `${name}@${version}`;
    return pkgNode;
}
/**
 * Build a dependency graph based on the yarn data.
 */
function buildYarnGraph(yarnData) {
    // 'a': ['b', 'c'] means 'a' depends on 'b' and 'c'
    const dependsOn = Object.create(null);
    Object.keys(yarnData).forEach(pkgName => {
        const pkg = yarnData[pkgName];
        const pkgNode = getNode(yarnData, pkgName);
        // If multiple version specs resolve to the same actual package version, we
        // only want to record the dependency once.
        if (dependsOn[pkgNode] !== undefined) {
            return;
        }
        dependsOn[pkgNode] = [];
        const deps = pkg.dependencies;
        if (deps) {
            Object.keys(deps).forEach(depName => {
                const depNode = getNode(yarnData, `${depName}@${deps[depName]}`);
                dependsOn[pkgNode].push(depNode);
            });
        }
    });
    return dependsOn;
}
/**
 * Construct a subgraph of all nodes reachable from the given nodes.
 */
function subgraph(graph, nodes) {
    const sub = Object.create(null);
    // Seed the graph
    let newNodes = nodes;
    while (newNodes.length > 0) {
        const old = newNodes;
        newNodes = [];
        old.forEach(i => {
            if (!(i in sub)) {
                sub[i] = graph[i];
                newNodes.push(...sub[i]);
            }
        });
    }
    return sub;
}
/**
 * Return the package.json data at the given path
 */
function pkgData(packagePath) {
    packagePath = path.join(packagePath, 'package.json');
    let data;
    try {
        data = utils.readJSONFile(packagePath);
    }
    catch (e) {
        console.error('Skipping package ' + packagePath);
        return {};
    }
    return data;
}
function convertDot(g, graphOptions, distinguishRoots = false, distinguishLeaves = false) {
    const edges = flat(Object.keys(g).map(a => g[a].map(b => [a, b]))).sort();
    const nodes = Object.keys(g).sort();
    // let leaves = Object.keys(g).filter(i => g[i].length === 0);
    // let roots = Object.keys(g).filter(i => g[i].length === 0);
    const dot = `
digraph DEPS {
  ${graphOptions || ''}
  ${nodes.map(node => `"${node}";`).join(' ')}
  ${edges.map(([a, b]) => `"${a}" -> "${b}"`).join('\n  ')}
}
`;
    return dot;
}
function main({ dependencies, devDependencies, jupyterlab, lerna, lernaExclude, lernaInclude, path, lumino, topLevel }) {
    const yarnData = readYarn(path);
    const graph = buildYarnGraph(yarnData);
    const paths = [path];
    if (lerna !== false) {
        paths.push(...utils.getLernaPaths(path).sort());
    }
    // Get all package data
    let data = paths.map(p => pkgData(p));
    // Get top-level package names (these won't be listed in yarn)
    const topLevelNames = new Set(data.map(d => d.name));
    // Filter lerna packages if a regex was supplied
    if (lernaInclude) {
        const re = new RegExp(lernaInclude);
        data = data.filter(d => d.name && d.name.match(re));
    }
    if (lernaExclude) {
        const re = new RegExp(lernaExclude);
        data = data.filter(d => d.name && !d.name.match(re));
    }
    const depKinds = [];
    if (devDependencies) {
        depKinds.push('devDependencies');
    }
    if (dependencies) {
        depKinds.push('dependencies');
    }
    /**
     * All dependency roots *except* other packages in this repo.
     */
    const dependencyRoots = data.map(d => {
        const roots = [];
        for (const depKind of depKinds) {
            const deps = d[depKind];
            if (deps === undefined) {
                continue;
            }
            const nodes = Object.keys(deps)
                .map(i => {
                // Do not get a package if it is a top-level package (and this is
                // not in yarn).
                if (!topLevelNames.has(i)) {
                    return getNode(yarnData, `${i}@${deps[i]}`);
                }
            })
                .filter(i => i !== undefined);
            roots.push(...nodes);
        }
        return roots;
    });
    // Find the subgraph
    const sub = subgraph(graph, flat(dependencyRoots));
    // Add in top-level lerna packages if desired
    if (topLevel) {
        data.forEach((d, i) => {
            sub[`${d.name}@${d.version}`] = dependencyRoots[i];
        });
    }
    // Filter out *all* lumino nodes
    if (!lumino) {
        Object.keys(sub).forEach(v => {
            sub[v] = sub[v].filter(w => !w.startsWith('@lumino/'));
        });
        Object.keys(sub).forEach(v => {
            if (v.startsWith('@lumino/')) {
                delete sub[v];
            }
        });
    }
    // Filter for any edges going into a jlab package, and then for any
    // disconnected jlab packages. This preserves jlab packages in the graph that
    // point to other packages, so we can see where third-party packages come
    // from.
    if (!jupyterlab) {
        Object.keys(sub).forEach(v => {
            sub[v] = sub[v].filter(w => !w.startsWith('@jupyterlab/'));
        });
        Object.keys(sub).forEach(v => {
            if (v.startsWith('@jupyterlab/') && sub[v].length === 0) {
                delete sub[v];
            }
        });
    }
    return sub;
}
commander_1.default
    .description(`Print out the dependency graph in dot graph format.`)
    .option('--lerna', 'Include dependencies in all lerna packages')
    .option('--lerna-include <regex>', 'A regex for package names to include in dependency roots')
    .option('--lerna-exclude <regex>', 'A regex for lerna package names to exclude from dependency roots (can override the include regex)')
    .option('--path [path]', 'Path to package or monorepo to investigate', '.')
    .option('--no-jupyterlab', 'Do not include dependency connections TO @jupyterlab org packages nor isolated @jupyterlab org packages')
    .option('--no-lumino', 'Do not include @lumino org packages')
    .option('--no-devDependencies', 'Do not include dev dependencies')
    .option('--no-dependencies', 'Do not include normal dependencies')
    .option('--no-top-level', 'Do not include the top-level packages')
    .option('--graph-options <options>', 'dot graph options (such as "ratio=0.25; concentrate=true;")')
    .action(args => {
    const graph = main(args);
    console.debug(convertDot(graph, args.graphOptions));
    console.error(`Nodes: ${Object.keys(graph).length}`);
});
commander_1.default.parse(process.argv);
//# sourceMappingURL=dependency-graph.js.map