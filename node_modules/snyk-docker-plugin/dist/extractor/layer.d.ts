/// <reference types="node" />
import { Readable } from "stream";
import { ExtractAction, ExtractedLayers } from "./types";
/**
 * Extract key files from the specified TAR stream.
 * @param layerTarStream image layer as a Readable TAR stream. Note: consumes the stream.
 * @param extractActions array of pattern, callbacks pairs
 * @returns extracted file products
 */
export declare function extractImageLayer(layerTarStream: Readable, extractActions: ExtractAction[]): Promise<ExtractedLayers>;
