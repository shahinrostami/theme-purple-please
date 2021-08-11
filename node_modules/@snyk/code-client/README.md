# code-client

Typescript consumer of public API

[![npm version](https://img.shields.io/npm/v/@snyk/code-client.svg?style=flat-square)](https://www.npmjs.org/package/@snyk/code-client)
[![npm downloads](https://img.shields.io/npm/dm/@snyk/code-client.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@snyk/code-client)

This package is published using:
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Installation

```shell script
$ npm install --save @snyk/code-client
```

# Usage

### Creates and initializes an instance

```javascript
import codeClient from '@snyk/code-client';

// An address of server which will be used in order to send code and analyse it.
const baseURL = 'https://www.snyk.io';
```

### Requests the creation of a new login session

```javascript
const loginResponse = await codeClient.startSession({
  baseURL,
  // An identificator for the editor using the Snyk APIs
  source: 'atom',
});

if (loginResponse.type === 'error') {
  // Handle error and alert user
}

const { sessionToken, loginURL } = loginResponse.value;
```

### Checks status of the login process

```javascript
const sessionResponse = await codeClient.checkSession({ baseURL, sessionToken });
if (sessionResponse.type === 'error') {
  // Handle error and alert user
}

const isLoggedIn = sessionResponse.value; // boolean
```

### Subscribe to events.

```javascript
/** Building bundle process started with provided data */
codeClient.emitter.on('scanFilesProgress', (processed: number) = {
  console.log(`Indexed ${processed} files`);
});

/** Bundle upload process is started with provided data */
codeClient.emitter.on('uploadBundleProgress', (processed: number, total: number) => {
  console.log(`Upload bundle progress: ${processed}/${total}`);
});

/** Receives an error object and logs an error message */
codeClient.emitter.on('sendError', error => {
  console.log(error);
});

/** Logs HTTP requests sent to the API **/
codeClient.emitter.on('apiRequestLog', (message) => {
  console.log(message);
});

```

Complete list of events:

- supportedFilesLoaded: uploading supported file extensions, can be also used for instantiating file watcher
- scanFilesProgress: emits a number of files being found
- createBundleProgress: emits a progress in instantiating packages for analysis
- uploadBundleProgress: emits a progress in uploading files
- analyseProgress: emits a progress in analysis job
- error: emits in case of an error

### Run analysis

```javascript
const results = await codeClient.analyzeFolders({
  connection: { baseURL, sessionToken, source },
  analysisOptions: {
    severity: 1,
  },
  fileOptions: {
    paths: ['/home/user/repo'],
    symlinksEnabled: false,
  },
});

```

### Creates a new bundle based on a previously uploaded one

```javascript
const results = await codeClient.extendAnalysis({
  ...previousAnalysisResults,
  files: {
    '/home/user/repo/main.js',
    '/home/user/repo/app.js',
  },
});

```

### Errors

If there are any errors the result of every call will contain the following:

```javascript
const { error, statusCode, statusText } = result;
```
