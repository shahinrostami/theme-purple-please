import * as crypto from "crypto";
import { Readable } from "stream";
import { HashAlgorithm } from "./types";

const HASH_ENCODING = "hex";

/**
 * https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
 */
type SupportedEncodings = "utf8" | "base64";

export async function streamToString(
  stream: Readable,
  streamSize?: number,
  encoding: SupportedEncodings = "utf8",
): Promise<string> {
  const chunks: string[] = [];
  return new Promise((resolve, reject) => {
    stream.on("end", () => {
      resolve(chunks.join(""));
    });
    stream.on("error", (error) => reject(error));
    stream.on("data", (chunk) => {
      chunks.push(chunk.toString(encoding));
    });
  });
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    stream.on("error", (error) => reject(error));
    stream.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
  });
}

async function streamToHash(
  stream: Readable,
  hashAlgorithm: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash(hashAlgorithm);
    hash.setEncoding(HASH_ENCODING);

    stream.on("end", () => {
      hash.end();
      resolve(hash.read().toString(HASH_ENCODING));
    });

    stream.on("error", (error) => reject(error));

    stream.pipe(hash);
  });
}

export async function streamToSha256(stream: Readable): Promise<string> {
  return streamToHash(stream, HashAlgorithm.Sha256);
}

export async function streamToSha1(stream: Readable): Promise<string> {
  return streamToHash(stream, HashAlgorithm.Sha1);
}

export async function streamToJson<T>(stream: Readable): Promise<T> {
  const file = await streamToString(stream);
  return JSON.parse(file);
}
