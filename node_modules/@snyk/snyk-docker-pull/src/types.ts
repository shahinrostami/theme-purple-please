export interface DirResult {
  name: string;
  removeCallback: () => void;
}

export interface DockerPullResult {
  imageDigest: string;
  stagingDir: DirResult | null;
  /** @deprecated caching is no longer used */
  cachedLayersDigests: string[];
  // The digests of the missing layers as returned in the manifest
  missingLayersDigests: string[];
  pullDuration: number;
  // Experimental: The digests calculated from the missing layers downloaded blobs.
  // Added as an experimental tool, and may be removed in future versions.
  missingLayersCalculatedDigests: string[];
}

export interface DockerPullOptions {
  username?: string;
  password?: string;
  // weak typing on the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reqOptions?: any;
  /**
   * loadImage will default to true if no value is sent
   */
  loadImage?: boolean;
  imageSavePath?: string;
  // Experimental. If set to true, calculate and return missing
  // layers digests from downloaded blobs.
  // Added as an experimental tool, and may be removed in future versions.
  calculateMissingLayersDigests?: boolean;
}

export interface SaveRequests {
  [name: string]: SaveRequest;
}

interface SaveRequest {
  username?: string;
  registryBase?: string;
  repo?: string;
  tag?: string;
}
