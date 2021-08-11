const debug = require('debug')('snyk:module');
import * as gitHost from 'hosted-git-info';

interface Package {
  name: string;
  version: string;
}

interface Options {
  loose?: boolean;
  packageManager?: string;
}

export default parsePackageString;

/**
 * Parses a string package id (name + optional version) to an object.
 *
 * This method used to be named `moduleToObject`.
 */
export function parsePackageString(
  nameAndMaybeVersion: string,
  versionOrOptions?: string | Options,
  options?: Options
): Package {
  if (!nameAndMaybeVersion) {
    throw new Error('requires string to parse into module');
  }

  let version: string | undefined;
  if (versionOrOptions && !options && typeof versionOrOptions === 'object') {
    options = versionOrOptions;
  } else {
    version = versionOrOptions as string | undefined;
  }

  let str = nameAndMaybeVersion;

  // first, try the common case; there's no version, and it's a normal package name
  if (!version) {
    // foo, foo-bar, @foo/bar, com.example:test
    // none of these can be URLs, or versions
    const fastPath = /^(?:(?:[a-z-]+)|(?:@[a-z-]+\/[a-z-]+)|(?:[a-z-]+\.[.a-z-]+:[a-z-]+))$/;
    if (fastPath.test(str)) {
      return supported(str, { name: str, version: '*' }, options);
    }
  }

  if (version && str.lastIndexOf('@') < 1) {
    debug('appending version onto string');
    str += '@' + version;
  }

  // first try with regular git urls
  const gitObject = looksLikeUrl(str);
  if (gitObject) {
    // then the string looks like a url, let's try to parse it
    return supported(str, fromGitObject(gitObject), options);
  }

  let parts = str.split('@');

  if (str.indexOf('@') === 0) {
    // put the scoped package name back together
    parts = parts.slice(1);
    parts[0] = '@' + parts[0];
  }

  // then as a backup, try pkg@giturl
  const maybeGitObject = parts[1] && looksLikeUrl(parts[1]);

  if (maybeGitObject) {
    // then the string looks like a url, let's try to parse it
    return supported(str, fromGitObject(maybeGitObject), options);
  }

  if (parts.length === 1) {
    // no version
    parts.push('*');
  }

  const module = {
    name: parts[0],
    version: parts.slice(1).join('@'),
  };

  return supported(str, module, options);
}

// git host from URL
function looksLikeUrl(str: string): gitHost {
  if (str.slice(-1) === '/') {
    // strip the trailing slash since we can't parse it properly anyway
    str = str.slice(0, -1);
  }

  if (
    str.toLowerCase().indexOf('://github.com/') !== -1 &&
    str.indexOf('http') === 0
  ) {
    // attempt to get better compat with our parser by stripping the github
    // and url parts
    // examples:
    // - https://github.com/Snyk/snyk/releases/tag/v1.14.2
    // - https://github.com/Snyk/vulndb/tree/snapshots
    // - https://github.com/Snyk/snyk/commit/75477b18
    const parts = str.replace(/https?:\/\/github.com\//, '').split('/');
    str = parts.shift() + '/' + parts.shift();

    if (parts.length) {
      str += '#' + parts.pop();
    }
  }

  const obj = gitHost.fromUrl(str);

  return obj;
}

function fromGitObject(obj: gitHost) {
  // debug('parsed from hosted-git-info');

  /* istanbul ignore if */
  if (!obj.project || !obj.user) {
    // this should never actually occur
    const error = new Error('not supported: failed to fully parse');
    (error as any).code = 501;
    throw error;
  }

  const module = {
    name: obj.project,
    version: obj.user + '/' + obj.project,
  };

  if (obj.committish) {
    module.version += '#' + obj.committish;
  }

  return module;
}

export function encode(name: string) {
  return name[0] + encodeURIComponent(name.slice(1));
}

function supported(str: string, module: Package, options?: Options) {
  if (!options) {
    options = {};
  }

  if (options.packageManager === 'maven') {
    if (str.indexOf(':') === -1) {
      throw new Error('invalid Maven package name: ' + str);
    }
    return module;
  }

  const protocolMatch = module.version.match(/^(https?:)|(git[:+])/i);
  if (protocolMatch || module.name.indexOf('://') !== -1) {
    // we don't support non-npm modules atm
    debug('not supported %s@%s (ext)', module.name, module.version);
    if (options.loose) {
      delete module.version;
    } else {
      debug('external module: ' + toString(module));
    }
  }

  if (module.version === 'latest' || !module.version) {
    module.version = '*';
  }

  debug(
    '%s => { name: "%s", version: "%s" }',
    str,
    module.name,
    module.version
  );

  return module;
}

function toString(module: Package) {
  return module.name + '@' + module.version;
}
