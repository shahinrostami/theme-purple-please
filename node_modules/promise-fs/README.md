# Promise FS

Wraps FS methods using Promise

## Installation

You can install this module using Yarn:

```
yarn add promise-fs
```

```
npm install promise-fs
```

## Usage

```js
  import fs from "promise-fs"

  fs.readFile("path/to/file")
    .then(content => console.log(String(content))) // Do something with the content
    .catch(err => console.log(err)) // Handle error
```

# Wrapped methods:

access, readFile, writeFile, close, open, read, write, rename, rmdir, mkdir, readdir, stat, lstat, fstat, appendFile, realpath, link, unlink, readlink, chmod, fchmod, chown, fchown, lchown, fsync, utimes, futimes, ftruncate

# License

MIT
