module.exports = filterIgnored;

const cloneDeep = require('lodash.clonedeep');
const debug = require('debug')('snyk:policy');
const matchToRule = require('../match').matchToRule;

// given an ignore ruleset (parsed from the .snyk yaml file) and a array of
// vulnerabilities, return the vulnerabilities that *are not* ignored
// see http://git.io/vCHmV for example of what ignore structure looks like
function filterIgnored(
  ignore,
  vuln,
  filtered,
  matchStrategy = 'packageManager'
) {
  if (!ignore) {
    return vuln;
  }

  if (!filtered) {
    filtered = [];
  }

  debug('filtering ignored');
  const now = new Date().toJSON();

  return vuln
    .map(function (vuln) {
      const applySecurityPolicyIgnore = vulnHasSecurityPolicyIgnore(vuln);
      if (!ignore[vuln.id] && !applySecurityPolicyIgnore) {
        return vuln;
      }

      debug('%s has rules', vuln.id);

      let appliedRules = [];

      if (applySecurityPolicyIgnore) {
        // logic: if vuln has securityPolicyMetaData.ignore rule, that means it comes
        // after security rule applied with the ignore action, thus we have to apply
        // this ignore and not any others.
        // Security policies ignores we apply to all paths "*" and disregardIfFixable=false
        const rule = vuln.securityPolicyMetaData.ignore;

        const {
          created,
          disregardIfFixable,
          ignoredBy,
          path,
          reason = '',
          reasonType,
          source,
        } = rule;

        appliedRules = [
          {
            [path[0]]: {
              reason,
              reasonType,
              source,
              ignoredBy,
              created,
              disregardIfFixable,
            },
          },
        ];
      } else {
        // logic: loop through all rules (from `ignore[vuln.id]`), and if *any* dep
        // paths match our vuln.from dep chain AND the rule hasn't expired, then the
        // vulnerability is ignored. if none of the rules match, then let we'll
        // keep it.

        // if rules.find, then ignore vuln
        appliedRules = ignore[vuln.id].filter(function (rule) {
          const path = Object.keys(rule)[0]; // this is a string
          let expires = rule[path].expires;

          if (expires && expires.toJSON) {
            expires = expires.toJSON();
          }

          // first check if the path is a match on the rule
          const pathMatch = matchToRule(vuln, rule, matchStrategy);

          if (pathMatch && expires && expires < now) {
            debug('%s vuln rule has expired (%s)', vuln.id, expires);
            return false;
          }

          if (
            pathMatch &&
            rule[path].disregardIfFixable &&
            (vuln.isUpgradable || vuln.isPatchable)
          ) {
            debug(
              '%s vuln is fixable and rule is set to disregard if fixable',
              vuln.id
            );
            return false;
          }

          if (pathMatch) {
            if (debug.enabled) {
              debug(
                'ignoring based on path match: %s ~= %s',
                path,
                vuln.from.slice(1).join(' > ')
              );
            }
            return true;
          }

          return false;
        });
      }

      if (appliedRules.length) {
        vuln.filtered = {
          ignored: appliedRules.map(function (rule) {
            const path = Object.keys(rule)[0];
            const ruleData = cloneDeep(rule[path]);
            ruleData.path = path.split(' > ');
            return ruleData;
          }),
        };
        filtered.push(vuln);
      }

      return appliedRules.length ? false : vuln;
    })
    .filter(Boolean);
}

const vulnHasSecurityPolicyIgnore = (vuln) => {
  return !!(vuln.securityPolicyMetaData && vuln.securityPolicyMetaData.ignore);
};
