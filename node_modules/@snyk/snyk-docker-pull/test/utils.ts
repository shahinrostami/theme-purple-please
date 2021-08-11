import { createReadStream } from "fs";
import { extract, Extract } from "tar-stream";
import * as subProcess from "../src/sub-process";

const DEFAULT_CWD = undefined;
const DEFAULT_ENV = undefined;

export async function removeImage(sha: string): Promise<subProcess.CmdOutput> {
  try {
    return await subProcess.execute(
      "docker",
      ["rmi", `${sha}`],
      DEFAULT_CWD,
      DEFAULT_ENV,
      true
    );
  } catch (err) {
    const stderr: string = err.stderr;
    if (!stderr.includes("image is referenced in multiple repositories")) {
      throw new Error(stderr);
    }
  }
}

export async function listTar(tarFilePath): Promise<string[]> {
  const tarExtractor: Extract = extract();
  const tarFileNames = [];
  await new Promise((resolve, reject) => {
    tarExtractor.on("entry", async (header, stream, next) => {
      tarFileNames.push(header.name);
      stream.on("end", () => {
        next(); // ready for next entry
      });
      stream.resume(); // auto drain the stream
    });

    tarExtractor.on("finish", resolve);
    tarExtractor.on("error", error => reject(error));

    createReadStream(tarFilePath).pipe(tarExtractor);
  });
  return tarFileNames;
}
