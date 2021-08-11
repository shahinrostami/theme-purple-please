const {isString, getType, isPlainObject, isArrayOf, map} = require("./util")

const isArray = Array.isArray

const filter = name => !(/.+(Sync|Stream|Promise)$/.test(name))

/**
 * Promisify Node.js callback-style function
 *
 * @param {function} target – a callback-style function
 * @param {any} [ctx = null]
 *
 * @return {function} - promised function
 *
 * @example
 *
 * import fs from "fs"
 *
 * const readFile = promisify(fs.readFile)
 *
 * const onFulfilled = content => console.log(String(content))
 *
 * const onRejected = err => console.error(err)
 *
 * readFile(__filename).then(onFulfilled, onRejected)
 */
function promisify(target, ctx = null) {
  if (typeof target !== "function") {
    throw TypeError(
      `Expected target function. Received ${getType(target)}`
    )
  }

  return function(...args) {
    ctx || (ctx = this)

    return new Promise((resolve, reject) => {
      const fulfill = (err, res) => err ? reject(err) : resolve(res)

      target.call(ctx, ...args, fulfill)
    })
  }
}

/**
 * Promisify all given methods
 *
 * @param {object} targets - object with the pairs of name => target
 * @param {any} [ctx = null]
 *
 * @return {object}
 */
function all(targets, ctx) {
  if (!isPlainObject(targets)) {
    throw new TypeError(
      `Expected a plain object as targets. Received ${getType(targets)}`
    )
  }

  return map(targets, (fn, name) => filter(name) ? promisify(fn, ctx) : fn)
}

/**
 * @param {object} targets
 * @param {string[]} list
 * @param {any} [ctx = null]
 *
 * @return {object}
 */
function some(targets, list, ctx) {
  if (!isPlainObject(targets)) {
    throw new TypeError(
      `Expected a plain object as targets. Received ${getType(targets)}`
    )
  }

  if (!isArray(list)) {
    throw new TypeError(`Expected list as an array. Received ${getType(list)}`)
  }

  if (!isArrayOf(list, isString)) {
    throw new TypeError("Each element in the list should be a string.")
  }

  return map(
    targets, (fn, name) => (
      filter(name) && list.includes(name) ? promisify(fn, ctx) : fn
    )
  )
}

/**
 * @param {object} targets
 * @param {string[]} list
 * @param {any} [ctx = null]
 *
 * @return {object}
 */
function except(targets, list, ctx) {
  if (!isPlainObject(targets)) {
    throw new TypeError(
      `Expected a plain object as targets. Received ${getType(targets)}`
    )
  }

  if (!isArray(list)) {
    throw new TypeError(`Expected list as an array. Received ${getType(list)}`)
  }

  if (!isArrayOf(list, isString)) {
    throw new TypeError("Each element in the list should be a string.")
  }

  return map(
    targets, (fn, name) => (
      filter(name) && !(list.includes(name)) ? promisify(fn, ctx) : fn
    )
  )
}

module.exports = promisify
module.exports.default = promisify
module.exports.all = all
module.exports.some = some
module.exports.except = except
