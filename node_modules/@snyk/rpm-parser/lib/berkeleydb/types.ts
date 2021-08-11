/**
 * Every entry in the index is a 2-byte offset that points somewhere in the current database page.
 */
export const HASH_INDEX_ENTRY_SIZE = 2;

/**
 * Every DB page has a 26 bytes header at the start of the page.
 */
export const DATABASE_PAGE_HEADER_SIZE = 26;

/**
 * Every BerkeleyDB will contain a magic number that additionally proves that
 * the file is of a particular type.
 */
export enum MagicNumber {
  DB_HASH = 0x061561,
}

/**
 * Every page in the database has a particular type.
 * These are the only types we need for fully reading the list of packages.
 */
export enum DatabasePageType {
  P_OVERFLOW = 7,
  P_HASHMETA = 8,
  P_HASH = 13,
}

/**
 * We are only interested in Hash pages of type Overflow since they are the only ones containing data.
 */
export enum HashPageType {
  H_OFFPAGE = 3,
}
