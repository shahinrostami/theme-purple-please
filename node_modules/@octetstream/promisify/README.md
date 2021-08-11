# @octetstream/promisify

Tiny, dependency free promisify library.

[![devDependencies Status](https://david-dm.org/octet-stream/promisify/dev-status.svg)](https://david-dm.org/octet-stream/promisify?type=dev)
[![Build Status](https://travis-ci.org/octet-stream/promisify.svg?branch=master)](https://travis-ci.org/octet-stream/promisify)
[![Code Coverage](https://codecov.io/github/octet-stream/promisify/coverage.svg?branch=master)](https://codecov.io/github/octet-stream/promisify?branch=master)

## API

### `promisify(target[, ctx]) -> {Function}`

Promisify Node.js callback-style function with native Promise

  - **{Function}** target - function, that will be wrap with a Promise
  - **{any}** [ctx = null] - "this" context for a target function

### `promisify.all(targets[, ctx]) -> {object}`

Promisify all functions from given object

  - **{object}** targets – object of target functinos
  - **{any}** [ctx = null] - "this" context for all wrapped functions

### `promisify.some(targets, list[, ctx]) -> {object}`

Promisify some functions from given object, that was specified in list

  - **{object}** targets – object of target functinos
  - **{string[]}** list – an array of target functions names
  - **{any}** [ctx = null] - "this" context for all wrapped functions

### `promisify.except(targets, list[, ctx]) -> {object}`

Promisify all functions from given object, except the ones from list

  - **{object}** targets – object of target functinos
  - **{string[]}** list – an array of target functions names
  - **{any}** [ctx = null] - "this" context for all wrapped functions
