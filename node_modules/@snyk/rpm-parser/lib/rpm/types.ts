/**
 * Size of an RPM metadata entry in bytes.
 */
export const ENTRY_INFO_SIZE = 16;

/** https://github.com/rpm-software-management/rpm/blob/ad1cad7e6a5def8b6036b90f2634297eda79dc7d/lib/rpmtag.h#L16-L25 */
export const PRIVATE_RPM_TAGS: ReadonlyArray<number> = [
  61, // Image
  62, // Signatures
  63, // Immutable
  64, // Regions
  100, // Internationalization table
  256, // Signature base
];

export interface EntryInfo {
  /**
   * See the following for a full list of RPM tags:
   * https://github.com/rpm-software-management/rpm/blob/ad1cad7e6a5def8b6036b90f2634297eda79dc7d/doc/manual/tags.md
   */
  tag: number; // Int32, Tag identifier.
  type: number; // UInt32, Tag data type.
  offset: number; // Int32, Offset into data segment (on-disk only).
  count: number; // UInt32, Number of tag elements.
}

export interface IndexEntry {
  info: EntryInfo; // Description of tag data.
  length: number; // Int32, No. bytes of data.
  data: Buffer;
}

/**
 * All of the entries in an RPM package are optional.
 * When reading them we try to populate as much as we can.
 */
export interface PackageInfo {
  name: string;
  version: string;
  release: string;
  size: number;
  arch?: string;
  epoch?: number;
}

export enum RpmTag {
  NAME = 1000,
  VERSION = 1001,
  RELEASE = 1002,
  EPOCH = 1003,
  SIZE = 1009,
  ARCH = 1022,
}

export enum RpmType {
  NULL = 0,
  CHAR = 1,
  INT8 = 2,
  INT16 = 3,
  INT32 = 4,
  INT64 = 5,
  STRING = 6,
  BIN = 7,
  STRING_ARRAY = 8,
  I18NSTRING = 9,
}
