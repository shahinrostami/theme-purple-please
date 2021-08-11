import { DATABASE_PAGE_HEADER_SIZE, HashPageType } from './types';
import { ParserError } from '../types';

/**
 * Traverse the data (overflow) pages and extract the data.
 * The data may be spread over multiple pages, so for every page we need to:
 * 1. Strip the page header of every page.
 * 2. Collate with data collected so far.
 * 3. Make sure to read the right data offset if we reach the last page.
 * The pages are not in order, so we may have to jump all across the BerkeleyDB file.
 * This is why we also need a Buffer to the database contents.
 * @param berkeleydb The contents of the database.
 * @param page Which page to start looking from. This should be an Overflow page.
 * @param pageStartOffset Which byte in the BerkeleyDB points to the start of the page.
 * @param pageSizeBytes How big is every page (typically it would be 4096 bytes).
 */
export function bufferToHashValueContent(
  berkeleydb: Buffer,
  page: Buffer,
  pageStartOffset: number,
  pageSizeBytes: number,
): Buffer {
  // The byte offset that describes the page type is the same regardless of the page type.
  // Note there may be 5 different page types of varying length, but we are interested only one.
  const pageType = page.readUInt8(pageStartOffset);
  if (pageType !== HashPageType.H_OFFPAGE) {
    throw new ParserError('Unsupported page type', { pageType });
  }

  const startPageNumber = page.readUInt32LE(pageStartOffset + 4);
  const dataLengthBytes = page.readUInt32LE(pageStartOffset + 8);

  const result = Buffer.alloc(dataLengthBytes);
  let bytesWritten = 0;

  // Traverse the pages, using "nextPageNumber" in the page metadata to see if we've reached the end.
  for (let currentPageNumber = startPageNumber; currentPageNumber !== 0; ) {
    const pageStart = pageSizeBytes * currentPageNumber;
    const pageEnd = pageStart + pageSizeBytes;

    const currentPage = berkeleydb.slice(pageStart, pageEnd);
    const nextPageNumber = currentPage.readUInt32LE(16);
    const freeAreaOffset = currentPage.readUInt16LE(22);

    const isLastPage = nextPageNumber === 0;
    const bytesToWrite = isLastPage
      ? // The last page points to where the data ends.
        currentPage.slice(DATABASE_PAGE_HEADER_SIZE, freeAreaOffset)
      : // Otherwise the whole page is filled with content.
        currentPage.slice(DATABASE_PAGE_HEADER_SIZE, currentPage.length);

    const byteOffset = bytesWritten;
    result.set(bytesToWrite, byteOffset);
    bytesWritten += bytesToWrite.length;

    currentPageNumber = nextPageNumber;
  }

  return result;
}
