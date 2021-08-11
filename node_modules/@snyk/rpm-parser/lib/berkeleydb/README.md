# BerkeleyDB module #

Handles reading the underlying BerkeleyDB version 5.x used as a backend for RPM.

The following sections cover BerkeleyDB version 5.x only.

The database is split into equally-sized pages. The database itself is of type Hash DB so this module is interested only in pages that signify this type.

## BerkeleyDB internals ##

The database layout looks like the following:

| Page layout: | Page number | Comment |
|---|---|---|
| Metadata page | 0 | Every page size is 4096 bytes |
| Hash page | | Says where to find the data |
| Overflow page | | Data may span multiple connected Overflow pages |
| Overflow page | | |
| Hash page | | |
| Overflow page | | |
| ... | n | The number of pages (n) is defined in the metadata page's last_pgno field |

The first page is the metadata page, which contains the database type, magic number, number of entries, etc. Subsequent pages are either Hash DB pages or Overflow pages.

- Every page has a metadata header that conveys what type of data is stored in the page.
- Hash DB pages contain an index of offsets at the start of the page. These offsets point to entries within the same page. Accessing the entries gives us key/value pairs -- the key is not relevant (it is just an internal value to BerkeleyDB) but the value tells us where to find the data. The value tells us where to start looking for data (from which page), and how big the data is.
- Overflow pages contain the actual data. The data may span multiple pages so pages are linked to each other using the `prev_pgno` and `next_pgno` fields of the page metadata.
- Data is obtained by going through all linked overflow pages and collating the raw bytes.

## Metadata page header ##

This header appears at the start of page 0.
Bytes 0-71 contain the generic BerkeleyDB header, whereas bytes 72-511 contain the Hash DB header.

| Field | Bytes | Comment | Usage
|---|---|---|---|
| lsn | 0-7 | Log sequence number | |
| pgno | 8-11 | Current page number | |
| magic | 12-15 | Magic number | Must have the value 0x061561 for Hash DB |
| version | 16-19 | Version | |
| pagesize | 20-23 | Page size | |
| encrypt_alg | 24 | Encryption algorithm | Not used in RPM |
| type | 25 | Page type | Must have the value 0x08 for Hash DB |
| metaflags | 26 | Meta-only flags | |
| unused1 | 27 | Unused | |
| free | 28-31 | Free list page number | |
| last_pgno | 32-35 | Page number of last page in db | |
| nparts | 36-39 | Number of partitions | |
| key_count | 40-43 | Cached key count | |
| record_count | 44-47 | Cached record count | |
| flags | 48-51 | Flags: unique to each AM | |
| uid | 52-71 | Unique file ID | |
| max_bucket | 72-75 | ID of maximum bucket in use | |
| high_mask | 76-79 | Modulo mask into table | |
| low_mask | 80-83 | Modulo mask into table lower half | |
| fill_factor | 84-87 | Fill factor | |
| nelem | 88-91 | Number of keys in hash table | Useful to verify if all data could be read |
| h_charkey | 92-95 | Value of hash(CHARKEY) | |
| spares | 96-223 | Spare pages for overflow | |
| unused | 224-459 | Unused space | |
| crypto_magic | 460-463 | Crypto magic number | Not used in RPM |
| trash | 464-475 | Trash space - not in use | |
| iv | 476-495 | Crypto IV |  Not used in RPM |
| chksum | 496-511 | Page checksum | Not used in RPM |

## Page header ##

This header appears at the start of every page regardless of its type and is 26-bytes long. This means that for a 4096-bytes page it leaves up to 4070 bytes for content.

| Field | Bytes | Comment | Usage
|---|---|---|---|
| lsn | 0-7 | Log sequence number | |
| pgno | 8-11 | Current page number | |
| prev_pgno | 12-15 | Previous page number | Useful for traversing linked Overflow-type pages |
| next_pgno | 16-19 | Next page number | Useful for traversing linked Overflow-type pages |
| entries | 20-21 | Number of items on the page | Useful for determining the size of the page index*, if this is a Hash page |
| hf_offset | 22-23 | High free byte page offset | Useful to determine where the data ends in an Overflow page |
| level | 24 | B-Tree page level | Not used in Hash DB |
| type | 25 | Page type | 0x07 for a Hash page, 0x0D for an Overflow page |

## Hash page index ##

| Hash page section | Bytes | Comment
|---|---|---|
| Page header | 0-25 | |
| Hash index | 26-n | Every index entry is 2 bytes. The number of entries (n) is defined in the entries field of the page header, hence the hash index is 2*n bytes long. |
| ... |
| Hash entries | m-4095 | Located at the end of the page, in reverse order. The start of the entries (m) is defined in the hf_offset field of the page header. |

The hash index contains 2-bytes long entries. Each entry is an offset to a byte in the current page. Reading this byte returns the type of hash entry, as defined below:

## Hash entries ##

The hash index can point to two types of entries: KEYDATA or OFFPAGE. Other types of entries are not used by RPM.

Hash entries are always stored as key/value pairs.

KEYDATA (Key/data entry) is 5 bytes long:
| KEYDATA entry layout | Bytes | Comment |
|---|---|---|
| type | 0 | Must have the value 0x01. |
| data | 1-4 | |

OFFPAGE (Overflow entry) is 12 bytes long:
| OFFPAGE entry layout | Bytes | Comment |
|---|---|---|
| type | 0 | Must have the value 0x03. |
| unused | 1-3 | Padding |
| pgno | 4-7 | Offset page number. This means that the data/content for this entry starts at that page number. Inspecting the page should return an Overflow page type in its page header. |
| tlen | 8-11 | Total length of the item. Defined in terms of bytes. Data may span multiple pages. | 
