![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)

***

![Known Vulnerabilities](https://snyk.io/test/github/snyk/rpm-parser/badge.svg)

Snyk helps you find, fix and monitor for known vulnerabilities in your dependencies, both on an ad hoc basis and as part of your CI (Build) system.

## Snyk RPM Parser ##

A library that reads the list of packages inside an RPM database file.

### How to use the parser ###

```js
import { getPackages } from '@snyk/rpm-parser';
import { readFileSync } from 'fs';

// ...

const rpmDatabase = readFileSync('/var/lib/rpm/Packages');
const result = await getPackages(rpmDatabase);

console.log(result.response);
```

### Limitations ###

The parser currently reads only BerkeleyDB version 5.x as the supported database backend. There are plans within RPM to use SQLite as the database backend but the parser currently does not work with SQLite.

### Bugs or issues ###

Please file an [Issue](https://github.com/snyk/rpm-parser/issues) under this repository, providing as much information as you can to reproduce the issue.

If possible, provide the RPM database file (`/var/lib/rpm/Packages`) or the Operating System used and the packaged installed using the package manager.

### How the parser works ###

Refer to the [BerkeleyDB module README](https://github.com/snyk/rpm-parser/blob/master/lib/berkeleydb/README.md) for a breakdown of the BerkeleyDB version 5.x database.

Refer to the [RPM module README](https://github.com/snyk/rpm-parser/blob/master/lib/rpm/README.md) for details on the package extraction.
