module.exports = tryRequire;

const fsModule = require('fs');
const util = require('util');
const path = require('path');
const debug = require('debug')('snyk:resolve:try-require');
const cloneDeep = require('lodash.clonedeep');
const LRU = require('lru-cache');
const options = { max: 100, maxAge: 1000 * 60 * 60 };
const cache = new LRU(options);

const fs = {
  readFile: util.promisify(fsModule.readFile),
  stat: util.promisify(fsModule.stat),
};

module.exports.cache = cache; // allows for a reset

function tryRequire(filename) {
  const cached = cache.get(filename);
  if (cached) {
    const res = cloneDeep(cached);
    /* istanbul ignore else */
    if (process.env.TAP) {
      res.__cached = true;
    }
    return Promise.resolve(res);
  }
  return fs.readFile(filename, 'utf8')
    .then(function (pkgStr) {
      let leadingBOM = '';
      if (pkgStr && pkgStr[0] === '\ufeff') {
        // String starts with UTF BOM. Remove it so that JSON.parse doesn't
        // stumble, but remember it for later use.
        pkgStr = pkgStr.slice(1);
        leadingBOM = '\ufeff';
      }

      const pkg = JSON.parse(pkgStr);
      pkg.leading = leadingBOM + pkgStr.match(/^(\s*){/)[1];
      pkg.trailing = pkgStr.match(/}(\s*)$/)[1];
      return pkg;
    })
    .catch(function (e) {
      debug('tryRequire silently failing on %s', e.message);
      return null;
    })
    .then(function (pkg) {
      if (!pkg) {
        return pkg;
      }

      // fixes potential issues later on
      if (!pkg.devDependencies) {
        pkg.devDependencies = {};
      }

      if (!pkg.dependencies) {
        pkg.dependencies = {};
      }

      if (!pkg.name) {
        pkg.name = path.basename(path.dirname(filename));
      }

      pkg.__filename = filename;

      // test for npm-shrinkwrap and find a .snyk policy file whilst we're at it
      const dir = path.dirname(filename);
      const promises = [
        fs.stat(path.resolve(dir, '.snyk')).catch(pass),
        fs.stat(path.resolve(dir, 'npm-shrinkwrap.json')).catch(pass),
      ];

      return Promise.all(promises).then(function (res) {
        if (!pkg.snyk) {
          pkg.snyk = res[0].isFile();
        }
        if (pkg.snyk) {
          pkg.snyk = dir;
        }

        if (res[1].isFile()) {
          pkg.shrinkwrap = true;
        }

        return pkg;
      });
    })
    .then(function (pkg) {
      cache.set(filename, pkg);
      return cloneDeep(pkg);
    });
}

const pass = function () {
  return {
    isFile: function () { return false; },
  };
};

/* istanbul ignore if */
if (!module.parent) {
  tryRequire(process.argv[2])
    .then(JSON.stringify)
    // eslint-disable-next-line no-console
    .then(console.log)
    // eslint-disable-next-line no-console
    .catch(console.log);
}
