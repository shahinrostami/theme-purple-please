import * as depGraph from "@snyk/dep-graph";
import { eventLoopSpinner } from "event-loop-spinner";

import { DEP_GRAPH_TYPE } from "./";
import { parserStrTab } from "./str-tab-parser";
import { Elf, GoPackage, PackageVersionTable } from "./types";
import { extractModulesFromBinary } from "./version-parser";

/**
 * Parse `.strtab` to get Go packages
 * Parse `.go.buildinfo` to get addresses
 * to go modules and their versions
 * @param goBinary
 */
export async function parseGoBinary(
  goBinary: Elf,
): Promise<depGraph.DepGraph | undefined> {
  // Non-stripped binaries contain data on ".strtab" section
  const strTab = goBinary.body.sections.find(
    (section) => section.name === ".strtab",
  );

  // TODO: stripped binaries are not supported in this iteration
  if (!strTab) {
    return undefined;
  }

  const { name, modules } = extractModulesFromBinary(goBinary);
  const packages: GoPackage[] = parserStrTab(strTab.data);

  // If there is no packages or modules, return empty result
  if (Object.keys(modules).length === 0 || packages.length === 0) {
    return undefined;
  }

  const packageVersionTable: PackageVersionTable = matchModuleToPackage(
    modules,
    packages,
  );
  return await createDepGraph(name, packageVersionTable);
}

/**
 * Package name consist of module name and path to package.
 * This function matches package to modules and their versions
 * @param moduleVersionTable
 * @param packages
 */
function matchModuleToPackage(
  moduleVersionTable: any,
  packages: GoPackage[],
): PackageVersionTable {
  const resultTable: PackageVersionTable = {};
  for (const pack of packages) {
    let moduleVersion = moduleVersionTable[pack];

    if (!moduleVersion) {
      const [packageModule] = Object.keys(moduleVersionTable)
        // Find all modules that this package can be from
        .filter((moduleName) => pack.startsWith(moduleName))
        // The longest string will be the closest match
        .sort((a, b) => b.length - a.length);

      if (!packageModule || !moduleVersionTable[packageModule]) {
        continue;
      }

      moduleVersion = moduleVersionTable[packageModule];
    }

    resultTable[pack] = moduleVersion;
  }

  return resultTable;
}

async function createDepGraph(
  name: string,
  packageVersionTable: PackageVersionTable,
): Promise<depGraph.DepGraph> {
  const goModulesDepGraph = new depGraph.DepGraphBuilder(
    { name: DEP_GRAPH_TYPE },
    { name },
  );

  for (const [name, version] of Object.entries(packageVersionTable)) {
    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }

    const nodeId = `${name}@${version}`;
    goModulesDepGraph.addPkgNode({ name, version }, nodeId);
    goModulesDepGraph.connectDep(goModulesDepGraph.rootNodeId, nodeId);
  }

  return goModulesDepGraph.build();
}
