# RPM module #

Once all data entries are obtained from the BerkeleyDB, the parser processes them as RPM metadata blobs.

The blobs contain many entries that describe a single package. Every entry (e.g. name, description, release, version, etc.) has its own header and data (the actual content). Once all entries are processed, the parser can build the full view of every installed package.
