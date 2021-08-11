# Usage
1. Generate an updated full.dcignore file based on the generator script.
```shell script
$ cd <repo-location>
$ npm run generate
```
2. Check the file contents in the root directory of this repository.
```shell script
$ cat empty.dcignore
$ cat full.dcignore
```
3. Tinker with the script to fine-tune the generator or edit the output files directly
4. Test the package locally to debug it
6. Publish the new version once pleased with the results

## Test package

1. To use and debug package locally you don't need publish it to NPM registry:
```shell script
$ cd <repo-location>
$ npm link
```
2. After that you have to create symlink to this package in the folder of the project where you want to test it:
```shell script
$ cd <project-location>
$ npm link @deepcode/dcignore
```
3. Add package to your `package.json`:
```json
"dependencies": {
  "@deepcode/dcignore": "^1.0.0"
}
```
4. Now you can use this package as usual:
```javascript
const { DefaultDCIgnore, CustomDCIgnore } = require('@deepcode/dcignore');

console.log(DefaultDCIgnore);
```

## Publishing

1. Before publishing make sure you are logged in using the company credentials
```shell script
$ npm login
```
2. Publish
```shell script
$ cd <repo-location>
$ npm publish --access public
```
