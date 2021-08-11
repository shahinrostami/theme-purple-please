import { PassThrough, Readable } from "stream";
import { streamToString } from "../stream-utils";
import { ExtractAction, FileNameAndContent } from "./types";

export async function applyCallbacks(
  matchedActions: ExtractAction[],
  fileContentStream: Readable,
  streamSize?: number,
): Promise<FileNameAndContent> {
  const result: FileNameAndContent = {};
  const actionsToAwait = matchedActions.map((action) => {
    // Using a pass through allows us to read the stream multiple times.
    const streamCopy = new PassThrough();
    fileContentStream.pipe(streamCopy);

    // Queue the promise but don't await on it yet: we want consumers to start around the same time.
    const promise =
      action.callback !== undefined
        ? action.callback(streamCopy, streamSize)
        : // If no callback was provided for this action then return as string by default.
          streamToString(streamCopy);

    return promise.then((content) => {
      // Assign the result once the Promise is complete.
      if (content) {
        result[action.actionName] = content;
      }
    });
  });

  await Promise.all(actionsToAwait);

  return result;
}

export function isResultEmpty(result: FileNameAndContent): boolean {
  return Object.keys(result).length === 0;
}
