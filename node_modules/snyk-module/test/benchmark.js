const b = require('benny');
const { parsePackageString } = require('../dist/index');

b.suite(
  'parse',

  b.add('parse maven', () => {
    parsePackageString('org.apache.httpcomponents:httpcomponents-core');
  }),

  b.add('parse namespace', () => {
    parsePackageString('@snyk/module');
  }),

  b.add('parse regular', () => {
    parsePackageString('modular-module');
  }),

  b.add('parse with version (slow path)', () => {
    parsePackageString('@snyk/module', '5');
  }),

  b.cycle(),
  b.complete()
);
