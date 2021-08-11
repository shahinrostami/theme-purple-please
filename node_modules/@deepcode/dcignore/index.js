const fs = require('fs');
const path = require('path');
const DefaultDCIgnore = fs.readFileSync(path.resolve(__dirname, 'full.dcignore'), 'utf8');
const CustomDCIgnore = fs.readFileSync(path.resolve(__dirname, 'empty.dcignore'), 'utf8');
module.exports = {
  DefaultDCIgnore,
  CustomDCIgnore
};
