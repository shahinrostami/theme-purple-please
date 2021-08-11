import * as childProcess from "child_process";
import { SpawnOptions } from "child_process";

export interface CmdOutput {
  stdout: string;
  stderr: string;
}

export async function execute(
  command: string,
  args?: string[],
  cwd?: string,
  env?: NodeJS.ProcessEnv,
  shell = false
): Promise<CmdOutput> {
  const spawnOptions: SpawnOptions = { shell };
  if (cwd) {
    spawnOptions.cwd = cwd;
  }
  if (env) {
    spawnOptions.env = env;
  }

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const proc = childProcess.spawn(command, args, spawnOptions);
    proc.stdout.on("data", data => {
      stdout = stdout + data;
    });
    proc.stderr.on("data", data => {
      stderr = stderr + data;
    });

    proc.on("close", code => {
      const output: CmdOutput = { stdout, stderr };
      if (code !== 0) {
        return reject(output);
      }
      resolve(output);
    });
  });
}
