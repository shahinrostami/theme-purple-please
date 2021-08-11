import * as fs from 'fs';
import * as path from 'path';
import { SinglePackageResult } from '@snyk/cli-interface/legacy/plugin';
import * as poetry from 'snyk-poetry-lockfile-parser';
import { getMetaData } from './inspect-implementation';
import { FILENAMES } from '../types';

export async function getPoetryDependencies(
  command: string,
  root: string,
  targetFile: string,
  includeDevDeps = false
): Promise<SinglePackageResult> {
  const lockfilePath = path.join(root, targetFile);
  const baseDir = path.dirname(lockfilePath);
  const manifestPath = path.join(baseDir, FILENAMES.poetry.manifest);
  const manifestExists = fs.existsSync(manifestPath);

  if (!manifestExists) {
    throw new Error('Cannot find manifest file ' + manifestPath);
  }
  const lockfileExists = fs.existsSync(lockfilePath);
  if (!lockfileExists) {
    throw new Error('Cannot find lockfile ' + lockfilePath);
  }

  try {
    const manifestContents = fs.readFileSync(manifestPath, 'utf-8');
    const lockfileContents = fs.readFileSync(lockfilePath, 'utf-8');
    const dependencyGraph = poetry.buildDepGraph(
      manifestContents,
      lockfileContents,
      includeDevDeps
    );
    const plugin = await getMetaData(command, [], root, targetFile);
    return {
      plugin,
      package: null,
      dependencyGraph,
    };
  } catch (error) {
    throw new Error(
      'Error processing poetry project. ' + error.message || error
    );
  }
}
