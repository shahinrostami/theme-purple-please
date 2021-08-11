module.exports = filterPatched;

const cloneDeep = require('lodash.clonedeep');
const debug = require('debug')('snyk:policy');
const matchToRule = require('../match').matchToRule;
const path = require('path');
const statSync = require('fs').statSync;
const getVulnSource = require('./get-vuln-source');

// cwd is used for testing
function filterPatched(patched, vulns, cwd, skipVerifyPatch, filteredPatches) {
  if (!patched) {
    return vulns;
  }

  if (!filteredPatches) {
    filteredPatches = [];
  }

  debug('filtering patched');
  return vulns
    .map(function (vuln) {
      if (!patched[vuln.id]) {
        return vuln;
      }

      debug('%s has rules', vuln.id);

      // logic: loop through all rules (from `patched[vuln.id]`), and if *any* dep
      // paths match our vuln.from dep chain AND a flag exists, then the
      // vulnerability is ignored. if none of the rules match, then let we'll
      // keep it.

      // if rules.find, then ignore vuln
      const vulnRules = patched[vuln.id]
        .map(function (rule) {
          // first check if the path is a match on the rule
          const pathMatch = matchToRule(vuln, rule);

          if (pathMatch) {
            const path = Object.keys(rule)[0]; // this is a string
            debug(
              '(patch) ignoring based on path match: %s ~= %s',
              path,
              vuln.from.slice(1).join(' > ')
            );
            return rule;
          }

          return false;
        })
        .filter(Boolean);

      // run through the potential rules to check if there's a patch flag in place
      const appliedRules = vulnRules.filter(function () {
        // the target directory where our module name will live
        if (skipVerifyPatch) {
          return true;
        }

        const source = getVulnSource(vuln, cwd, true);

        const id = vuln.id.replace(/:/g, '-');
        const flag = path.resolve(source, '.snyk-' + id + '.flag');
        const oldFlag = path.resolve(source, '.snyk-' + vuln.id + '.flag');
        let res = false;
        try {
          res = statSync(flag);
        } catch (e) {
          try {
            res = statSync(oldFlag);
          } catch (e) {}
        }

        debug('flag found for %s? %s', vuln.id);

        return !!res;
      });

      if (appliedRules.length) {
        vuln.filtered = {
          patches: appliedRules.map(function (rule) {
            const path = Object.keys(rule)[0];
            const ruleData = cloneDeep(rule[path]) || {};
            ruleData.path = path.split(' > ');
            return ruleData;
          }),
        };
        filteredPatches.push(vuln);
      }

      return appliedRules.length ? false : vuln;
    })
    .filter(Boolean);
}
