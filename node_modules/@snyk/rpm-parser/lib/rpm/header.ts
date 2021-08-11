import { eventLoopSpinner } from 'event-loop-spinner';

import {
  IndexEntry,
  ENTRY_INFO_SIZE,
  EntryInfo,
  PRIVATE_RPM_TAGS,
} from './types';
import { ParserError } from '../types';

/**
 * Transform a blob of metadadata into addressable RPM package entries.
 * The entries need to be further processed to extract package information.
 * @param data A blob of RPM metadata, as stored inside BerkeleyDB.
 */
export async function headerImport(data: Buffer): Promise<IndexEntry[]> {
  const indexLength = data.readInt32BE(0);
  const dataLength = data.readInt32BE(4);

  if (indexLength <= 0 || indexLength > 50_000) {
    // Ensure we don't allocate something crazy...
    throw new ParserError('Invalid index length', { indexLength });
  }

  const entryInfos = new Array<EntryInfo>();

  // Skip the first 2 items (index and data lengths)
  const dataStart = 8 + indexLength * ENTRY_INFO_SIZE;

  const index = data.slice(8, indexLength * ENTRY_INFO_SIZE);

  for (let i = 0; i < indexLength; i++) {
    const entry = index.slice(
      i * ENTRY_INFO_SIZE,
      i * ENTRY_INFO_SIZE + ENTRY_INFO_SIZE,
    );

    if (entry.length < ENTRY_INFO_SIZE) {
      continue;
    }

    const entryInfo: EntryInfo = {
      tag: entry.readInt32BE(0),
      type: entry.readUInt32BE(4),
      offset: entry.readInt32BE(8),
      count: entry.readUInt32BE(12),
    };

    if (PRIVATE_RPM_TAGS.includes(entryInfo.tag)) {
      continue;
    }

    entryInfos.push(entryInfo);

    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }
  }

  return regionSwab(data, entryInfos, dataStart, dataLength);
}

async function regionSwab(
  data: Buffer,
  entryInfos: EntryInfo[],
  dataStart: number,
  dataLength: number,
): Promise<IndexEntry[]> {
  const indexEntries = new Array<IndexEntry>(entryInfos.length);

  for (let i = 0; i < entryInfos.length; i++) {
    const entryInfo = entryInfos[i];

    const entryLength =
      i < entryInfos.length - 1
        ? entryInfos[i + 1].offset - entryInfo.offset
        : dataLength - entryInfo.offset;

    const entryStart = dataStart + entryInfo.offset;
    const entryEnd = entryStart + entryLength;

    const indexEntry: IndexEntry = {
      info: entryInfo,
      data: data.slice(entryStart, entryEnd),
      length: entryLength,
    };

    indexEntries[i] = indexEntry;

    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }
  }

  return indexEntries;
}
