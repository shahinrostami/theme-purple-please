'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const simpleKeyRegExp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const colorStringRegExp = /^#[0-9a-f]{6}$/i;
const colorStringAlphaRegExp = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
// https://stackoverflow.com/a/475217/880703
const base64RegExp = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
// https://stackoverflow.com/a/14166194/880703
const uuid4RegExp = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/i;
// https://stackoverflow.com/a/28022901/880703 + https://www.debuggex.com/r/bl8J35wMKk48a7u_
const iso8601RegExp = /^(?:[1-9]\d{3}(-?)(?:(?:0[1-9]|1[0-2])\1(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])\1(?:29|30)|(?:0[13578]|1[02])(?:\1)31|00[1-9]|0[1-9]\d|[12]\d{2}|3(?:[0-5]\d|6[0-5]))|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)(?:(-?)02(?:\2)29|-?366))T(?:[01]\d|2[0-3])(:?)[0-5]\d(?:\3[0-5]\d)?(?:Z|[+-][01]\d(?:\3[0-5]\d)?)$/;
const makeTrait = (value) => () => {
    return value;
};
function makeValidator({ test }) {
    return makeTrait(test)();
}
function getPrintable(value) {
    if (value === null)
        return `null`;
    if (value === undefined)
        return `undefined`;
    if (value === ``)
        return `an empty string`;
    return JSON.stringify(value);
}
function computeKey(state, key) {
    var _a, _b, _c;
    if (typeof key === `number`) {
        return `${(_a = state === null || state === void 0 ? void 0 : state.p) !== null && _a !== void 0 ? _a : `.`}[${key}]`;
    }
    else if (simpleKeyRegExp.test(key)) {
        return `${(_b = state === null || state === void 0 ? void 0 : state.p) !== null && _b !== void 0 ? _b : ``}.${key}`;
    }
    else {
        return `${(_c = state === null || state === void 0 ? void 0 : state.p) !== null && _c !== void 0 ? _c : `.`}[${JSON.stringify(key)}]`;
    }
}
function makeCoercionFn(target, key) {
    return (v) => {
        const previous = target[key];
        target[key] = v;
        return makeCoercionFn(target, key).bind(null, previous);
    };
}
function makeSetter(target, key) {
    return (v) => {
        target[key] = v;
    };
}
function plural(n, singular, plural) {
    return n === 1 ? singular : plural;
}
function pushError({ errors, p } = {}, message) {
    errors === null || errors === void 0 ? void 0 : errors.push(`${p !== null && p !== void 0 ? p : `.`}: ${message}`);
    return false;
}
const isUnknown = () => makeValidator({
    test: (value, state) => {
        return true;
    },
});
function isLiteral(expected) {
    return makeValidator({
        test: (value, state) => {
            if (value !== expected)
                return pushError(state, `Expected a literal (got ${getPrintable(expected)})`);
            return true;
        },
    });
}
const isString = () => makeValidator({
    test: (value, state) => {
        if (typeof value !== `string`)
            return pushError(state, `Expected a string (got ${getPrintable(value)})`);
        return true;
    },
});
function isEnum(enumSpec) {
    const valuesArray = Array.isArray(enumSpec) ? enumSpec : Object.values(enumSpec);
    const values = new Set(valuesArray);
    return makeValidator({
        test: (value, state) => {
            if (!values.has(value))
                return pushError(state, `Expected a valid enumeration value (got ${getPrintable(value)})`);
            return true;
        },
    });
}
const BOOLEAN_COERCIONS = new Map([
    [`true`, true],
    [`True`, true],
    [`1`, true],
    [1, true],
    [`false`, false],
    [`False`, false],
    [`0`, false],
    [0, false],
]);
const isBoolean = () => makeValidator({
    test: (value, state) => {
        var _a;
        if (typeof value !== `boolean`) {
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                    return pushError(state, `Unbound coercion result`);
                const coercion = BOOLEAN_COERCIONS.get(value);
                if (typeof coercion !== `undefined`) {
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, coercion)]);
                    return true;
                }
            }
            return pushError(state, `Expected a boolean (got ${getPrintable(value)})`);
        }
        return true;
    },
});
const isNumber = () => makeValidator({
    test: (value, state) => {
        var _a;
        if (typeof value !== `number`) {
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                    return pushError(state, `Unbound coercion result`);
                let coercion;
                if (typeof value === `string`) {
                    let val;
                    try {
                        val = JSON.parse(value);
                    }
                    catch (_b) { }
                    // We check against JSON.stringify that the output is the same to ensure that the number can be safely represented in JS
                    if (typeof val === `number`) {
                        if (JSON.stringify(val) === value) {
                            coercion = val;
                        }
                        else {
                            return pushError(state, `Received a number that can't be safely represented by the runtime (${value})`);
                        }
                    }
                }
                if (typeof coercion !== `undefined`) {
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, coercion)]);
                    return true;
                }
            }
            return pushError(state, `Expected a number (got ${getPrintable(value)})`);
        }
        return true;
    },
});
const isDate = () => makeValidator({
    test: (value, state) => {
        var _a;
        if (!(value instanceof Date)) {
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                    return pushError(state, `Unbound coercion result`);
                let coercion;
                if (typeof value === `string` && iso8601RegExp.test(value)) {
                    coercion = new Date(value);
                }
                else {
                    let timestamp;
                    if (typeof value === `string`) {
                        let val;
                        try {
                            val = JSON.parse(value);
                        }
                        catch (_b) { }
                        if (typeof val === `number`) {
                            timestamp = val;
                        }
                    }
                    else if (typeof value === `number`) {
                        timestamp = value;
                    }
                    if (typeof timestamp !== `undefined`) {
                        if (Number.isSafeInteger(timestamp) || !Number.isSafeInteger(timestamp * 1000)) {
                            coercion = new Date(timestamp * 1000);
                        }
                        else {
                            return pushError(state, `Received a timestamp that can't be safely represented by the runtime (${value})`);
                        }
                    }
                }
                if (typeof coercion !== `undefined`) {
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, coercion)]);
                    return true;
                }
            }
            return pushError(state, `Expected a date (got ${getPrintable(value)})`);
        }
        return true;
    },
});
const isArray = (spec, { delimiter } = {}) => makeValidator({
    test: (value, state) => {
        var _a;
        if (typeof value === `string` && typeof delimiter !== `undefined`) {
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                    return pushError(state, `Unbound coercion result`);
                value = value.split(delimiter);
                state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, value)]);
            }
        }
        if (!Array.isArray(value))
            return pushError(state, `Expected an array (got ${getPrintable(value)})`);
        let valid = true;
        for (let t = 0, T = value.length; t < T; ++t) {
            valid = spec(value[t], Object.assign(Object.assign({}, state), { p: computeKey(state, t), coercion: makeCoercionFn(value, t) })) && valid;
            if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                break;
            }
        }
        return valid;
    },
});
const isTuple = (spec, { delimiter } = {}) => {
    const lengthValidator = hasExactLength(spec.length);
    return makeValidator({
        test: (value, state) => {
            var _a;
            if (typeof value === `string` && typeof delimiter !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    value = value.split(delimiter);
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, value)]);
                }
            }
            if (!Array.isArray(value))
                return pushError(state, `Expected a tuple (got ${getPrintable(value)})`);
            let valid = lengthValidator(value, Object.assign({}, state));
            for (let t = 0, T = value.length; t < T && t < spec.length; ++t) {
                valid = spec[t](value[t], Object.assign(Object.assign({}, state), { p: computeKey(state, t), coercion: makeCoercionFn(value, t) })) && valid;
                if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                    break;
                }
            }
            return valid;
        },
    });
};
const isDict = (spec, { keys: keySpec = null, } = {}) => makeValidator({
    test: (value, state) => {
        if (typeof value !== `object` || value === null)
            return pushError(state, `Expected an object (got ${getPrintable(value)})`);
        const keys = Object.keys(value);
        let valid = true;
        for (let t = 0, T = keys.length; t < T && (valid || (state === null || state === void 0 ? void 0 : state.errors) != null); ++t) {
            const key = keys[t];
            const sub = value[key];
            if (key === `__proto__` || key === `constructor`) {
                valid = pushError(Object.assign(Object.assign({}, state), { p: computeKey(state, key) }), `Unsafe property name`);
                continue;
            }
            if (keySpec !== null && !keySpec(key, state)) {
                valid = false;
                continue;
            }
            if (!spec(sub, Object.assign(Object.assign({}, state), { p: computeKey(state, key), coercion: makeCoercionFn(value, key) }))) {
                valid = false;
                continue;
            }
        }
        return valid;
    },
});
const isObject = (props, { extra: extraSpec = null, } = {}) => {
    const specKeys = Object.keys(props);
    return makeValidator({
        test: (value, state) => {
            if (typeof value !== `object` || value === null)
                return pushError(state, `Expected an object (got ${getPrintable(value)})`);
            const keys = new Set([...specKeys, ...Object.keys(value)]);
            const extra = {};
            let valid = true;
            for (const key of keys) {
                if (key === `constructor` || key === `__proto__`) {
                    valid = pushError(Object.assign(Object.assign({}, state), { p: computeKey(state, key) }), `Unsafe property name`);
                }
                else {
                    const spec = Object.prototype.hasOwnProperty.call(props, key)
                        ? props[key]
                        : undefined;
                    const sub = Object.prototype.hasOwnProperty.call(value, key)
                        ? value[key]
                        : undefined;
                    if (typeof spec !== `undefined`) {
                        valid = spec(sub, Object.assign(Object.assign({}, state), { p: computeKey(state, key), coercion: makeCoercionFn(value, key) })) && valid;
                    }
                    else if (extraSpec === null) {
                        valid = pushError(Object.assign(Object.assign({}, state), { p: computeKey(state, key) }), `Extraneous property (got ${getPrintable(sub)})`);
                    }
                    else {
                        Object.defineProperty(extra, key, {
                            enumerable: true,
                            get: () => sub,
                            set: makeSetter(value, key)
                        });
                    }
                }
                if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                    break;
                }
            }
            if (extraSpec !== null && (valid || (state === null || state === void 0 ? void 0 : state.errors) != null))
                valid = extraSpec(extra, state) && valid;
            return valid;
        },
    });
};
const isInstanceOf = (constructor) => makeValidator({
    test: (value, state) => {
        if (!(value instanceof constructor))
            return pushError(state, `Expected an instance of ${constructor.name} (got ${getPrintable(value)})`);
        return true;
    },
});
const isOneOf = (specs, { exclusive = false, } = {}) => makeValidator({
    test: (value, state) => {
        var _a, _b, _c;
        const matches = [];
        const errorBuffer = typeof (state === null || state === void 0 ? void 0 : state.errors) !== `undefined`
            ? [] : undefined;
        for (let t = 0, T = specs.length; t < T; ++t) {
            const subErrors = typeof (state === null || state === void 0 ? void 0 : state.errors) !== `undefined`
                ? [] : undefined;
            const subCoercions = typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`
                ? [] : undefined;
            if (specs[t](value, Object.assign(Object.assign({}, state), { errors: subErrors, coercions: subCoercions, p: `${(_a = state === null || state === void 0 ? void 0 : state.p) !== null && _a !== void 0 ? _a : `.`}#${t + 1}` }))) {
                matches.push([`#${t + 1}`, subCoercions]);
                if (!exclusive) {
                    break;
                }
            }
            else {
                errorBuffer === null || errorBuffer === void 0 ? void 0 : errorBuffer.push(subErrors[0]);
            }
        }
        if (matches.length === 1) {
            const [, subCoercions] = matches[0];
            if (typeof subCoercions !== `undefined`)
                (_b = state === null || state === void 0 ? void 0 : state.coercions) === null || _b === void 0 ? void 0 : _b.push(...subCoercions);
            return true;
        }
        if (matches.length > 1)
            pushError(state, `Expected to match exactly a single predicate (matched ${matches.join(`, `)})`);
        else
            (_c = state === null || state === void 0 ? void 0 : state.errors) === null || _c === void 0 ? void 0 : _c.push(...errorBuffer);
        return false;
    },
});
const applyCascade = (spec, followups) => makeValidator({
    test: (value, state) => {
        var _a, _b;
        const context = { value: value };
        const subCoercion = typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`
            ? makeCoercionFn(context, `value`) : undefined;
        const subCoercions = typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`
            ? [] : undefined;
        if (!spec(value, Object.assign(Object.assign({}, state), { coercion: subCoercion, coercions: subCoercions })))
            return false;
        const reverts = [];
        if (typeof subCoercions !== `undefined`)
            for (const [, coercion] of subCoercions)
                reverts.push(coercion());
        try {
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                if (context.value !== value) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, context.value)]);
                }
                (_b = state === null || state === void 0 ? void 0 : state.coercions) === null || _b === void 0 ? void 0 : _b.push(...subCoercions);
            }
            return followups.every(spec => {
                return spec(context.value, state);
            });
        }
        finally {
            for (const revert of reverts) {
                revert();
            }
        }
    },
});
const isOptional = (spec) => makeValidator({
    test: (value, state) => {
        if (typeof value === `undefined`)
            return true;
        return spec(value, state);
    },
});
const isNullable = (spec) => makeValidator({
    test: (value, state) => {
        if (value === null)
            return true;
        return spec(value, state);
    },
});
const hasMinLength = (length) => makeValidator({
    test: (value, state) => {
        if (!(value.length >= length))
            return pushError(state, `Expected to have a length of at least ${length} elements (got ${value.length})`);
        return true;
    },
});
const hasMaxLength = (length) => makeValidator({
    test: (value, state) => {
        if (!(value.length <= length))
            return pushError(state, `Expected to have a length of at most ${length} elements (got ${value.length})`);
        return true;
    },
});
const hasExactLength = (length) => makeValidator({
    test: (value, state) => {
        if (!(value.length === length))
            return pushError(state, `Expected to have a length of exactly ${length} elements (got ${value.length})`);
        return true;
    },
});
const hasUniqueItems = ({ map, } = {}) => makeValidator({
    test: (value, state) => {
        const set = new Set();
        const dup = new Set();
        for (let t = 0, T = value.length; t < T; ++t) {
            const sub = value[t];
            const key = typeof map !== `undefined`
                ? map(sub)
                : sub;
            if (set.has(key)) {
                if (dup.has(key))
                    continue;
                pushError(state, `Expected to contain unique elements; got a duplicate with ${getPrintable(value)}`);
                dup.add(key);
            }
            else {
                set.add(key);
            }
        }
        return dup.size === 0;
    },
});
const isNegative = () => makeValidator({
    test: (value, state) => {
        if (!(value <= 0))
            return pushError(state, `Expected to be negative (got ${value})`);
        return true;
    },
});
const isPositive = () => makeValidator({
    test: (value, state) => {
        if (!(value >= 0))
            return pushError(state, `Expected to be positive (got ${value})`);
        return true;
    },
});
const isAtLeast = (n) => makeValidator({
    test: (value, state) => {
        if (!(value >= n))
            return pushError(state, `Expected to be at least ${n} (got ${value})`);
        return true;
    },
});
const isAtMost = (n) => makeValidator({
    test: (value, state) => {
        if (!(value <= n))
            return pushError(state, `Expected to be at most ${n} (got ${value})`);
        return true;
    },
});
const isInInclusiveRange = (a, b) => makeValidator({
    test: (value, state) => {
        if (!(value >= a && value <= b))
            return pushError(state, `Expected to be in the [${a}; ${b}] range (got ${value})`);
        return true;
    },
});
const isInExclusiveRange = (a, b) => makeValidator({
    test: (value, state) => {
        if (!(value >= a && value < b))
            return pushError(state, `Expected to be in the [${a}; ${b}[ range (got ${value})`);
        return true;
    },
});
const isInteger = ({ unsafe = false, } = {}) => makeValidator({
    test: (value, state) => {
        if (value !== Math.round(value))
            return pushError(state, `Expected to be an integer (got ${value})`);
        if (!Number.isSafeInteger(value))
            return pushError(state, `Expected to be a safe integer (got ${value})`);
        return true;
    },
});
const matchesRegExp = (regExp) => makeValidator({
    test: (value, state) => {
        if (!regExp.test(value))
            return pushError(state, `Expected to match the pattern ${regExp.toString()} (got ${getPrintable(value)})`);
        return true;
    },
});
const isLowerCase = () => makeValidator({
    test: (value, state) => {
        if (value !== value.toLowerCase())
            return pushError(state, `Expected to be all-lowercase (got ${value})`);
        return true;
    },
});
const isUpperCase = () => makeValidator({
    test: (value, state) => {
        if (value !== value.toUpperCase())
            return pushError(state, `Expected to be all-uppercase (got ${value})`);
        return true;
    },
});
const isUUID4 = () => makeValidator({
    test: (value, state) => {
        if (!uuid4RegExp.test(value))
            return pushError(state, `Expected to be a valid UUID v4 (got ${getPrintable(value)})`);
        return true;
    },
});
const isISO8601 = () => makeValidator({
    test: (value, state) => {
        if (!iso8601RegExp.test(value))
            return pushError(state, `Expected to be a valid ISO 8601 date string (got ${getPrintable(value)})`);
        return false;
    },
});
const isHexColor = ({ alpha = false, }) => makeValidator({
    test: (value, state) => {
        const res = alpha
            ? colorStringRegExp.test(value)
            : colorStringAlphaRegExp.test(value);
        if (!res)
            return pushError(state, `Expected to be a valid hexadecimal color string (got ${getPrintable(value)})`);
        return true;
    },
});
const isBase64 = () => makeValidator({
    test: (value, state) => {
        if (!base64RegExp.test(value))
            return pushError(state, `Expected to be a valid base 64 string (got ${getPrintable(value)})`);
        return true;
    },
});
const isJSON = (spec = isUnknown()) => makeValidator({
    test: (value, state) => {
        let data;
        try {
            data = JSON.parse(value);
        }
        catch (_a) {
            return pushError(state, `Expected to be a valid JSON string (got ${getPrintable(value)})`);
        }
        return spec(data, state);
    },
});
const hasRequiredKeys = (requiredKeys) => {
    const requiredSet = new Set(requiredKeys);
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            const problems = [];
            for (const key of requiredSet)
                if (!keys.has(key))
                    problems.push(key);
            if (problems.length > 0)
                return pushError(state, `Missing required ${plural(problems.length, `property`, `properties`)} ${problems.map(name => `"${name}"`).join(`, `)}`);
            return true;
        },
    });
};
const hasForbiddenKeys = (forbiddenKeys) => {
    const forbiddenSet = new Set(forbiddenKeys);
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            const problems = [];
            for (const key of forbiddenSet)
                if (keys.has(key))
                    problems.push(key);
            if (problems.length > 0)
                return pushError(state, `Forbidden ${plural(problems.length, `property`, `properties`)} ${problems.map(name => `"${name}"`).join(`, `)}`);
            return true;
        },
    });
};
const hasMutuallyExclusiveKeys = (exclusiveKeys) => {
    const exclusiveSet = new Set(exclusiveKeys);
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            const used = [];
            for (const key of exclusiveSet)
                if (keys.has(key))
                    used.push(key);
            if (used.length > 1)
                return pushError(state, `Mutually exclusive properties ${used.map(name => `"${name}"`).join(`, `)}`);
            return true;
        },
    });
};
(function (KeyRelationship) {
    KeyRelationship["Forbids"] = "Forbids";
    KeyRelationship["Requires"] = "Requires";
})(exports.KeyRelationship || (exports.KeyRelationship = {}));
const keyRelationships = {
    [exports.KeyRelationship.Forbids]: {
        expect: false,
        message: `forbids using`,
    },
    [exports.KeyRelationship.Requires]: {
        expect: true,
        message: `requires using`,
    },
};
const hasKeyRelationship = (subject, relationship, others, { ignore = [], } = {}) => {
    const skipped = new Set(ignore);
    const otherSet = new Set(others);
    const spec = keyRelationships[relationship];
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            if (!keys.has(subject) || skipped.has(value[subject]))
                return true;
            const problems = [];
            for (const key of otherSet)
                if ((keys.has(key) && !skipped.has(value[key])) !== spec.expect)
                    problems.push(key);
            if (problems.length >= 1)
                return pushError(state, `Property "${subject}" ${spec.message} ${plural(problems.length, `property`, `properties`)} ${problems.map(name => `"${name}"`).join(`, `)}`);
            return true;
        },
    });
};

exports.applyCascade = applyCascade;
exports.base64RegExp = base64RegExp;
exports.colorStringAlphaRegExp = colorStringAlphaRegExp;
exports.colorStringRegExp = colorStringRegExp;
exports.computeKey = computeKey;
exports.getPrintable = getPrintable;
exports.hasExactLength = hasExactLength;
exports.hasForbiddenKeys = hasForbiddenKeys;
exports.hasKeyRelationship = hasKeyRelationship;
exports.hasMaxLength = hasMaxLength;
exports.hasMinLength = hasMinLength;
exports.hasMutuallyExclusiveKeys = hasMutuallyExclusiveKeys;
exports.hasRequiredKeys = hasRequiredKeys;
exports.hasUniqueItems = hasUniqueItems;
exports.isArray = isArray;
exports.isAtLeast = isAtLeast;
exports.isAtMost = isAtMost;
exports.isBase64 = isBase64;
exports.isBoolean = isBoolean;
exports.isDate = isDate;
exports.isDict = isDict;
exports.isEnum = isEnum;
exports.isHexColor = isHexColor;
exports.isISO8601 = isISO8601;
exports.isInExclusiveRange = isInExclusiveRange;
exports.isInInclusiveRange = isInInclusiveRange;
exports.isInstanceOf = isInstanceOf;
exports.isInteger = isInteger;
exports.isJSON = isJSON;
exports.isLiteral = isLiteral;
exports.isLowerCase = isLowerCase;
exports.isNegative = isNegative;
exports.isNullable = isNullable;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isOneOf = isOneOf;
exports.isOptional = isOptional;
exports.isPositive = isPositive;
exports.isString = isString;
exports.isTuple = isTuple;
exports.isUUID4 = isUUID4;
exports.isUnknown = isUnknown;
exports.isUpperCase = isUpperCase;
exports.iso8601RegExp = iso8601RegExp;
exports.makeCoercionFn = makeCoercionFn;
exports.makeSetter = makeSetter;
exports.makeTrait = makeTrait;
exports.makeValidator = makeValidator;
exports.matchesRegExp = matchesRegExp;
exports.plural = plural;
exports.pushError = pushError;
exports.simpleKeyRegExp = simpleKeyRegExp;
exports.uuid4RegExp = uuid4RegExp;
