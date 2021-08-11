import { OciArchiveManifest } from "../types";
export { extractArchive } from "./layer";
export declare function getManifestLayers(manifest: OciArchiveManifest): string[];
export declare function getImageIdFromManifest(manifest: OciArchiveManifest): string;
