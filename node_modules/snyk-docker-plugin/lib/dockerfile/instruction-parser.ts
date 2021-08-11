import { Dockerfile, Instruction } from "dockerfile-ast";
import {
  DockerFileAnalysisErrorCode,
  DockerFileLayers,
  DockerFilePackages,
  GetDockerfileBaseImageNameResult,
} from "./types";

export {
  getDockerfileBaseImageName,
  getLayersFromPackages,
  getPackagesFromDockerfile,
  instructionDigest,
  getPackagesFromRunInstructions,
};

// Naive regex; see tests for cases
// tslint:disable-next-line:max-line-length
const installRegex = /(rpm\s+-i|rpm\s+--install|apk\s+((--update|-u|--no-cache)\s+)*add(\s+(--update|-u|--no-cache))*|apt-get\s+((--assume-yes|--yes|-y)\s+)*install(\s+(--assume-yes|--yes|-y))*|apt\s+((--assume-yes|--yes|-y)\s+)*install|yum\s+install|aptitude\s+install)\s+/;

function getPackagesFromDockerfile(dockerfile: Dockerfile): DockerFilePackages {
  const runInstructions = getRunInstructionsFromDockerfile(dockerfile);
  return getPackagesFromRunInstructions(runInstructions);
}

function getRunInstructionsFromDockerfile(dockerfile: Dockerfile) {
  return dockerfile
    .getInstructions()
    .filter(
      (instruction) => instruction.getInstruction().toUpperCase() === "RUN",
    )
    .map((instruction) =>
      getInstructionExpandVariables(instruction, dockerfile),
    );
}

/*
 * This is fairly ugly because a single RUN could contain multiple install
 * commands, which in turn may install multiple packages, so we've got a
 * 3-level nested array (RUN instruction[] -> install[] -> package[])
 *
 * We also need to account for the multiple ways to split commands, and
 * arbitrary whitespace
 */
function getPackagesFromRunInstructions(runInstructions: string[]) {
  return runInstructions.reduce((dockerfilePackages, instruction) => {
    const cleanedInstruction = removeRunDefFromInstruction(instruction);
    const commands = cleanedInstruction.split(/\s?(;|&&)\s?/);
    const installCommands = commands.filter((command) =>
      installRegex.test(command),
    );

    if (installCommands.length) {
      // Get the packages per install command and flatten them
      for (const command of installCommands) {
        const packages = command
          .replace(installRegex, "")
          .split(/\s+/)
          .filter((arg) => arg && !arg.startsWith("-"));

        packages.forEach((pkg) => {
          // Use package name without version as the key
          let name = pkg.split("=")[0];
          if (name.startsWith("$")) {
            name = name.slice(1);
          }
          dockerfilePackages[name] = { instruction };
        });
      }
    }

    return dockerfilePackages;
  }, {});
}

function removeRunDefFromInstruction(instruction: string) {
  let cleanedInstruction = instruction;
  const runDefs = ["RUN ", "/bin/sh ", "RUN /bin/sh"];
  for (const runDef of runDefs) {
    if (cleanedInstruction.startsWith(runDef)) {
      cleanedInstruction = cleanedInstruction.slice(runDef.length);
    }
  }
  return cleanedInstruction;
}

/**
 * Return the specified text with variables expanded
 * @param instruction the instruction associated with this string
 * @param dockerfile Dockerfile to use for expanding the variables
 * @param text a string with variables to expand, if not specified
 *  the instruction text is used
 */
function getInstructionExpandVariables(
  instruction: Instruction,
  dockerfile: Dockerfile,
  text?: string,
): string {
  let str = text || instruction.toString();
  const variables = instruction.getVariables();
  const resolvedVariables = variables.reduce((resolvedVars, variable) => {
    const line = variable.getRange().start.line;
    const name = variable.getName();
    resolvedVars[name] = dockerfile.resolveVariable(name, line);
    return resolvedVars;
  }, {});
  for (const variable of Object.keys(resolvedVariables)) {
    // The $ is a special regexp character that should be escaped with a backslash
    // Support both notations either with $variable_name or ${variable_name}
    // The global search "g" flag is used to match and replace all occurrences
    str = str.replace(
      RegExp(`\\$\{${variable}\}|\\$${variable}`, "g"),
      resolvedVariables[variable] || "",
    );
  }
  return str;
}

/**
 * Return the image name of the last from stage, after resolving all aliases
 * @param dockerfile Dockerfile to use for retrieving the last stage image name
 */
function getDockerfileBaseImageName(
  dockerfile: Dockerfile,
): GetDockerfileBaseImageNameResult {
  const froms = dockerfile.getFROMs();
  // collect stages names
  const stagesNames = froms.reduce(
    (stagesNames, fromInstruction) => {
      const fromName = fromInstruction.getImage() as string;
      const args = fromInstruction.getArguments();
      // the FROM expanded base name
      const expandedName = getInstructionExpandVariables(
        fromInstruction,
        dockerfile,
        fromName,
      );
      const hasUnresolvedVariables =
        expandedName.split(":").some((name) => !name) ||
        expandedName.split("@").some((name) => !name);
      // store the resolved stage name
      if (!hasUnresolvedVariables) {
        stagesNames.last = stagesNames.aliases[expandedName] || expandedName;
      }
      if (args.length > 2 && args[1].getValue().toUpperCase() === "AS") {
        // the AS alias name
        const aliasName = args[2].getValue();
        // support nested referral
        stagesNames.aliases[aliasName] = stagesNames.last;
      }
      return stagesNames;
    },
    { last: undefined, aliases: {} },
  );

  if (stagesNames.last) {
    return {
      baseImage: stagesNames.last,
    };
  }

  if (!froms.length) {
    return {
      error: {
        code: DockerFileAnalysisErrorCode.BASE_IMAGE_NAME_NOT_FOUND,
      },
    };
  }

  return {
    error: {
      code: DockerFileAnalysisErrorCode.BASE_IMAGE_NON_RESOLVABLE,
    },
  };
}

function instructionDigest(instruction): string {
  return Buffer.from(instruction).toString("base64");
}

function getLayersFromPackages(
  dockerfilePkgs: DockerFilePackages,
): DockerFileLayers {
  return Object.keys(dockerfilePkgs).reduce((res, pkg) => {
    const { instruction } = dockerfilePkgs[pkg];
    res[instructionDigest(instruction)] = { instruction };
    return res;
  }, {});
}
