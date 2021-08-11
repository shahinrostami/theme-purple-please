import { eventLoopSpinner } from 'event-loop-spinner';

import { bufferToHashIndexValues } from './database-pages';
import { bufferToHashValueContent } from './hash-pages';
import { MagicNumber, DatabasePageType, HashPageType } from './types';
import { ParserError } from '../types';

export { bufferToHashIndexValues, bufferToHashValueContent };

const validPageSizes: ReadonlyArray<number> = [
  512,
  1024,
  2048,
  4096,
  8192,
  16384,
  32768,
  65536,
];

/**
 * Extract the RPM package contents from a BerkeleyDB. Note that the contents
 * are returned as a Buffer of data for every package and that they need to be further
 * processed to extract meaningful package information.
 *
 * This implementation is interested in finding only data blobs of type Hash DB.
 *
 * The BerkeleyDB that we are interested in contains only the following pages:
 * - A metadata page -- the first page (index 0) of the database.
 * - A Hash DB page -- this page basically tells us where to find the data in the BerkeleyDB.
 * - An Overflow page -- this page contains the data. The data may span multiple pages (hence "overflow" pages).
 * @param data The contents of a BerkeleyDB database.
 */
export async function bufferToHashDbValues(
  data: Buffer,
): Promise<Buffer[] | never> {
  validateBerkeleyDbMetadata(data);

  const pageSize = data.readUInt32LE(20);
  validatePageSize(pageSize);

  const lastPageNumber = data.readUInt32LE(32);

  const result = new Array<Buffer>();

  // The 0th index page is the database metadata page, so start from the 1st index page.
  for (let pageNumber = 1; pageNumber < lastPageNumber; pageNumber++) {
    const pageStart = pageNumber * pageSize;
    const pageEnd = pageStart + pageSize;

    const pageType = data[pageStart + 25];
    // Look only for HASH pages, we will traverse their content in subsequent steps.
    if (pageType !== DatabasePageType.P_HASH) {
      continue;
    }

    const page = data.slice(pageStart, pageEnd);
    const entries = page.readUInt16LE(20);
    // Hash DB entries come in key/value pairs. We are only interested in the values.
    const hashIndex = bufferToHashIndexValues(page, entries);

    for (const hashPage of hashIndex) {
      const valuePageType = page[hashPage];
      // Only Overflow pages contain package data, skip anything else.
      if (valuePageType !== HashPageType.H_OFFPAGE) {
        continue;
      }

      // Traverse the page to concatenate the data that may span multiple pages.
      const valueContent = bufferToHashValueContent(
        data,
        page,
        hashPage,
        pageSize,
      );

      result.push(valueContent);
    }

    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }
  }

  return result;
}

/**
 * Exported for testing
 */
export function validateBerkeleyDbMetadata(data: Buffer): void | never {
  // We are only interested in Hash DB. Other types are B-Tree, Queue, Heap, etc.
  const magicNumber = data.readUInt32LE(12);
  if (magicNumber !== MagicNumber.DB_HASH) {
    throw new ParserError('Unexpected database magic number', { magicNumber });
  }

  // The first page of the database must be a Hash DB metadata page.
  const pageType = data.readUInt8(25);
  if (pageType !== DatabasePageType.P_HASHMETA) {
    throw new ParserError('Unexpected page type', { pageType });
  }

  const encryptionAlgorithm = data.readUInt8(24);
  if (encryptionAlgorithm !== 0) {
    throw new ParserError('Encrypted databases are not supported', {
      encryptionAlgorithm,
    });
  }

  // We will be pre-allocating some memory for the entries in the database.
  // Choose a very high, possibly unrealistic number, for the number of installed
  // packages on the system. We don't want to allocate too much memory.
  const entriesCount = data.readUInt32LE(88);
  if (entriesCount < 0 || entriesCount > 50_000) {
    throw new ParserError('Invalid number of entries in the database', {
      entriesCount,
    });
  }
}

/**
 * Exported for testing
 */
export function validatePageSize(pageSize: number): void | never {
  if (!validPageSizes.includes(pageSize)) {
    throw new ParserError('Invalid page size', { pageSize });
  }
}
