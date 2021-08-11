const keys = Object.keys

const toString = val => Object.prototype.toString.call(val)

const getType = val => toString(val).slice(8, -1).toLowerCase()

const isString = val => typeof val === "string" || getType(val) === "string"

// Based ob lodash/isPlainObject
function isPlainObject(val) {
  if (getType(val) !== "object") {
    return false
  }

  const pp = Object.getPrototypeOf(val)

  if (pp === null || pp === void 0) {
    return true
  }

  const Ctor = pp.constructor && pp.constructor.toString()

  return Ctor === Object.toString()
}

function isArrayOf(arr, predicate, ctx = null) {
  for (const [key, val] of arr.entries()) {
    if (predicate.call(ctx, val, key, arr) === false) {
      return false
    }
  }

  return true
}

function map(obj, fn) {
  const res = {}

  for (const key of keys(obj)) {
    const val = obj[key]

    res[key] = fn(val, key, obj)
  }

  return res
}

module.exports = {isArrayOf, getType, isString, isPlainObject, map}
