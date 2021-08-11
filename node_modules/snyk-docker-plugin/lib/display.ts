import chalk from "chalk";
import * as os from "os";

import { createFromJSON, DepGraph } from "@snyk/dep-graph";
import {
  BaseImageRemediationAdvice,
  ContainerTarget,
  Issue,
  Options,
  ScanResult,
  TestResult,
} from "./types";

const BREAK_LINE = os.EOL;
const SECTION_PADDING_TO_FORMAT_METADATA = 19;

export async function display(
  scanResults: ScanResult[],
  testResults: TestResult[],
  errors: string[],
  options?: Options,
): Promise<string> {
  const result: string[] = [];
  let index = 0;
  for (const testResult of testResults) {
    const formattedIssue: string[] = [];
    for (const issue of testResult.issues) {
      formattedIssue.push(formatIssue(testResult, issue));
    }
    result.push(formattedIssue.join(BREAK_LINE));
    result.push(includeSectionSeparator());

    const scanResult: ScanResult = scanResults[index];
    const metadata = formatMetadataSection(scanResult, testResult);
    result.push(metadata);
    result.push(includeSectionSeparator());

    const summary = formatSummary(testResult);
    result.push(summary);
    result.push(includeSectionSeparator());

    const remediations = formatRemediations(testResult);
    if (remediations) {
      result.push(remediations);
      result.push(includeSectionSeparator());
    }

    const suggestions = formatSuggestions(options);
    if (suggestions) {
      result.push(suggestions);
      result.push(includeSectionSeparator());
    }

    const userCTA = formatUserCTA(options);
    if (userCTA) {
      result.push(userCTA);
    }

    index += 1;
  }

  return result.join(BREAK_LINE);
}

function includeSectionSeparator(): string {
  return BREAK_LINE;
}

function formatIssue(testResult: TestResult, issue: Issue): string {
  const result: string[] = [];
  const issueData = testResult.issuesData[issue.issueId];
  const severity = capitalize(issueData.severity);
  const pkg = issue.pkgName;
  const color = getColor(issueData.severity);

  const header = color(`✗ ${severity} severity vulnerability found in ${pkg}`);
  const description = `  Description: ${issueData.title}`;
  const info = `  Info: https://snyk.io/vuln/${issue.issueId}`;
  const introduced = `  Introduced through: ${formatIntroduced(
    issueData.from,
  )}`;
  const from = formatFrom(issueData.from);
  const fixedIn = formatFixedIn(issue);

  result.push(header);
  result.push(description);
  result.push(info);
  result.push(introduced);
  result.push(from);
  if (fixedIn) {
    result.push(fixedIn);
  }
  result.push("");

  return result.join(BREAK_LINE);
}

function capitalize(word: string): string {
  return word[0].toUpperCase() + word.slice(1);
}

function formatIntroduced(fromList: string[][]) {
  const result: string[] = [];

  for (const from of fromList) {
    result.push(from[0]);
  }

  return result.join(", ");
}
function formatFrom(fromList: string[][]): string {
  const result: string[] = [];
  let counter = 0;
  const max = 3;
  for (const localFrom of fromList) {
    if (counter >= max) {
      break;
    }
    counter += 1;

    result.push(`  From: ${localFrom.join(" > ")}`);
  }
  if (fromList.length > max) {
    result.push(`  and ${(fromList.length = max)} more...`);
  }

  return result.join(BREAK_LINE);
}

function formatFixedIn(issue: Issue): string | undefined {
  if (!issue.fixInfo || !issue.fixInfo.nearestFixedInVersion) {
    return undefined;
  }

  return chalk.bold.green(`  Fixed in: ${issue.fixInfo.nearestFixedInVersion}`);
}

function formatMetadataSection(
  scanResult: ScanResult,
  testResult: TestResult,
): string {
  const result: string[] = [];
  result.push(formatMetadataLine("Organization:", testResult.org));

  const packageManager = scanResult.identity.type;
  result.push(formatMetadataLine("Package manager:", packageManager));

  const target: ContainerTarget = scanResult.target as ContainerTarget;
  const projectName = target.image;
  const image = target.image.replace("docker-image|", "");
  result.push(formatMetadataLine("Project name:", projectName));
  result.push(formatMetadataLine("Docker image:", image));
  if (testResult.docker && testResult.docker.baseImage) {
    result.push(formatMetadataLine("Base image:", testResult.docker.baseImage));
  }
  if (testResult.licensesPolicy) {
    result.push(formatMetadataLine("Licenses:", chalk.green("enabled")));
  }
  const platform = scanResult.identity.args?.platform;
  if (platform) {
    result.push(formatMetadataLine("Platform:", platform));
  }

  return result.join(BREAK_LINE);
}

function formatMetadataLine(header: string, info: string = ""): string {
  return `${chalk.green(
    padding(header, SECTION_PADDING_TO_FORMAT_METADATA),
  )} ${info}`;
}

function formatSummary(testResult: TestResult): string {
  const depGraph: DepGraph = createFromJSON(testResult.depGraphData);
  const pkgCount = depGraph?.getDepPkgs()?.length || 0;
  const pathOrDepsText = `${pkgCount} dependencies`;
  const testedInfoText = `Tested ${pathOrDepsText} for known issues`;
  const vulnPathsText = formatVulnSummaryText(testResult.issues);
  let summaryText = `${testedInfoText}, ${vulnPathsText}`;
  if (testResult.issues.length === 0) {
    summaryText = chalk.green(`✓ ${summaryText}`);
  }

  return summaryText;
}

function formatVulnSummaryText(issues: Issue[]): string {
  if (issues.length > 0) {
    return chalk.bold.red(`found ${issues.length} issues.`);
  }

  return "no vulnerable paths found.";
}

function getColor(severity: string): (text: string) => string {
  let color: (text: string) => string;
  switch (severity) {
    case "low":
      color = chalk.bold.blue;
      break;
    case "medium":
      color = chalk.bold.yellow;
      break;
    case "high":
      color = chalk.bold.red;
      break;
    default:
      color = chalk.whiteBright;
      break;
  }

  return color;
}

export function formatRemediations(res: TestResult) {
  if (!res.docker || !res.docker.baseImageRemediation) {
    return "";
  }
  const { advice, message } = res.docker.baseImageRemediation;
  const out = [] as any[];

  if (advice) {
    for (const item of advice) {
      out.push(formatString(item)(item.message));
    }
  } else if (message) {
    out.push(message);
  } else {
    return "";
  }
  return `${out.join(BREAK_LINE)}`;
}

function formatString({ color, bold }: BaseImageRemediationAdvice) {
  let formatter = chalk;
  if (color && formatter[color]) {
    formatter = formatter[color];
  }
  if (bold) {
    formatter = formatter.bold;
  }
  return formatter;
}

function formatSuggestions(options): string {
  if (options.isDockerUser) {
    return "";
  }

  const dockerSuggestion: string[] = [];
  if (options.config && options.config.disableSuggestions !== "true") {
    const optOutSuggestions =
      "To remove this message in the future, please run `snyk config set disableSuggestions=true`";
    if (!options.file) {
      dockerSuggestion.push(
        chalk.bold.white(
          "Pro tip: use `--file` option to get base image remediation advice.",
        ),
      );
      dockerSuggestion.push(
        chalk.bold.white(
          `Example: $ snyk container test ${options.path} --file=path/to/Dockerfile`,
        ),
      );
      dockerSuggestion.push(BREAK_LINE);
      dockerSuggestion.push(optOutSuggestions);
    } else if (!options["exclude-base-image-vulns"]) {
      dockerSuggestion.push(
        chalk.bold.white(
          "Pro tip: use `--exclude-base-image-vulns` to exclude from display Docker base image vulnerabilities.",
        ),
      );
      dockerSuggestion.push(BREAK_LINE);
      dockerSuggestion.push(optOutSuggestions);
    }
  }
  return dockerSuggestion.join(BREAK_LINE);
}

function formatUserCTA(options): string {
  if (options.isDockerUser) {
    return "For more free scans that keep your images secure, sign up to Snyk at https://dockr.ly/3ePqVcp";
  }
  return "";
}

function padding(s: string, padding: number) {
  const padLength = padding - s.length;
  if (padLength <= 0) {
    return s;
  }

  return s + " ".repeat(padLength);
}
