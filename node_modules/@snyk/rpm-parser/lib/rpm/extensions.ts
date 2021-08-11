import { eventLoopSpinner } from 'event-loop-spinner';

import { IndexEntry, PackageInfo, RpmTag, RpmType } from './types';
import { ParserError } from '../types';

/**
 * Iterate through RPM metadata entries to build the full package data.
 * @param entries Entries that were previously extracted from a BerkeleyDB blob.
 */
export async function getPackageInfo(
  entries: IndexEntry[],
): Promise<PackageInfo | undefined> {
  const packageInfo: Partial<PackageInfo> = {};

  for (const entry of entries) {
    switch (entry.info.tag) {
      case RpmTag.NAME:
        if (entry.info.type !== RpmType.STRING) {
          throw new ParserError('Unexpected type for name tag', {
            type: entry.info.type,
          });
        }
        packageInfo.name = extractString(entry.data);
        break;

      case RpmTag.RELEASE:
        if (entry.info.type !== RpmType.STRING) {
          throw new ParserError('Unexpected type for release tag', {
            type: entry.info.type,
          });
        }
        packageInfo.release = extractString(entry.data);
        break;

      case RpmTag.ARCH:
        if (entry.info.type !== RpmType.STRING) {
          throw new ParserError('Unexpected type for arch tag', {
            type: entry.info.type,
          });
        }
        packageInfo.arch = extractString(entry.data);
        break;

      case RpmTag.EPOCH:
        if (entry.info.type !== RpmType.INT32) {
          throw new ParserError('Unexpected type for epoch tag', {
            type: entry.info.type,
          });
        }
        packageInfo.epoch = entry.data.readInt32BE(0);
        break;

      case RpmTag.SIZE:
        if (entry.info.type !== RpmType.INT32) {
          throw new ParserError('Unexpected type for size tag', {
            type: entry.info.type,
          });
        }
        packageInfo.size = entry.data.readInt32BE(0);
        break;

      case RpmTag.VERSION:
        if (entry.info.type !== RpmType.STRING) {
          throw new ParserError('Unexpected type for version tag', {
            type: entry.info.type,
          });
        }
        packageInfo.version = extractString(entry.data);
        break;

      default:
        break;
    }

    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }
  }

  return isPackageInfo(packageInfo) ? packageInfo : undefined;
}

/**
 * The content may be padded with zeros so we can't directly convert it to string.
 * Find the first 0 byte which indicates where the string ends.
 */
function extractString(data: Buffer): string {
  const contentEnd = data.indexOf(0);
  return data.slice(0, contentEnd).toString('utf-8');
}

/**
 * Type checks to assert we are dealing with the expected type.
 */
function isPackageInfo(
  packageInfo: Partial<PackageInfo>,
): packageInfo is PackageInfo {
  return (
    packageInfo.name !== undefined &&
    packageInfo.version !== undefined &&
    packageInfo.release !== undefined &&
    packageInfo.size !== undefined
  );
}
