module.exports = addComments;

const initialComment =
  '# Snyk (https://snyk.io) policy file, patches or ' +
  'ignores known vulnerabilities.';
const inlineComments = {
  ignore:
    '# ignores vulnerabilities until expiry date; change duration by ' +
    'modifying expiry date',
  patch: '# patches apply the minimum changes required to fix a vulnerability',
};

function addComments(policyExport) {
  const lines = policyExport.split('\n');
  lines.unshift(initialComment);

  Object.keys(inlineComments).forEach(function (key) {
    const position = lines.indexOf(key + ':');
    if (position !== -1) {
      lines.splice(position, 0, inlineComments[key]);
    }
  });

  return lines.join('\n');
}
