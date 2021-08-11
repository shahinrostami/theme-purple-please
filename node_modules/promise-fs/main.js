const fs = require("fs")

const promisify = require("@octetstream/promisify")

const isFunction = value => typeof value === "function"

const names = [
  "access",
  "readFile",
  "writeFile",
  "copyFile",
  "close",
  "open",
  "read",
  "write",
  "rename",
  "rmdir",
  "mkdir",
  "readdir",
  "stat",
  "lstat",
  "fstat",
  "appendFile",
  "realpath",
  "link",
  "unlink",
  "readlink",
  "chmod",
  "fchmod",
  "chown",
  "fchown",
  "lchown",
  "fsync",
  "utimes",
  "futimes",
  "ftruncate"
]

const pfs = promisify.some(fs, names.filter(name => isFunction(fs[name])))

module.exports = pfs
module.exports.default = pfs
