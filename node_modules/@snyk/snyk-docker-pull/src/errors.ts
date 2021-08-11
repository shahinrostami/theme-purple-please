export class InvalidManifestSchemaVersionError extends Error {
  public code: number;

  constructor(version: number) {
    super(`Invalid manifest schema version ${version}`);
    this.code = 422;
  }
}
