"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_parse_1 = __importDefault(require("url-parse"));
/**
 * The namespace for URL-related functions.
 */
var URLExt;
(function (URLExt) {
    /**
     * Parse a url into a URL object.
     *
     * @param urlString - The URL string to parse.
     *
     * @returns A URL object.
     */
    function parse(url) {
        if (typeof document !== 'undefined' && document) {
            let a = document.createElement('a');
            a.href = url;
            return a;
        }
        return url_parse_1.default(url);
    }
    URLExt.parse = parse;
    /**
     * Normalize a url.
     */
    function normalize(url) {
        return url && parse(url).toString();
    }
    URLExt.normalize = normalize;
    /**
     * Join a sequence of url components and normalizes as in node `path.join`.
     *
     * @param parts - The url components.
     *
     * @returns the joined url.
     */
    function join(...parts) {
        parts = parts || [];
        // Isolate the top element.
        const top = parts[0] || '';
        // Check whether protocol shorthand is being used.
        const shorthand = top.indexOf('//') === 0;
        // Parse the top element into a header collection.
        const header = top.match(/(\w+)(:)(\/\/)?/);
        const protocol = header && header[1];
        const colon = protocol && header[2];
        const slashes = colon && header[3];
        // Construct the URL prefix.
        const prefix = shorthand
            ? '//'
            : [protocol, colon, slashes].filter(str => str).join('');
        // Construct the URL body omitting the prefix of the top value.
        const body = [top.indexOf(prefix) === 0 ? top.replace(prefix, '') : top]
            // Filter out top value if empty.
            .filter(str => str)
            // Remove leading slashes in all subsequent URL body elements.
            .concat(parts.slice(1).map(str => str.replace(/^\//, '')))
            .join('/')
            // Replace multiple slashes with one.
            .replace(/\/+/g, '/');
        return prefix + body;
    }
    URLExt.join = join;
    /**
     * Encode the components of a multi-segment url.
     *
     * @param url - The url to encode.
     *
     * @returns the encoded url.
     *
     * #### Notes
     * Preserves the `'/'` separators.
     * Should not include the base url, since all parts are escaped.
     */
    function encodeParts(url) {
        return join(...url.split('/').map(encodeURIComponent));
    }
    URLExt.encodeParts = encodeParts;
    /**
     * Return a serialized object string suitable for a query.
     *
     * @param object - The source object.
     *
     * @returns an encoded url query.
     *
     * #### Notes
     * Modified version of [stackoverflow](http://stackoverflow.com/a/30707423).
     */
    function objectToQueryString(value) {
        const keys = Object.keys(value).filter(key => key.length > 0);
        if (!keys.length) {
            return '';
        }
        return ('?' +
            keys
                .map(key => {
                const content = encodeURIComponent(String(value[key]));
                return key + (content ? '=' + content : '');
            })
                .join('&'));
    }
    URLExt.objectToQueryString = objectToQueryString;
    /**
     * Return a parsed object that represents the values in a query string.
     */
    function queryStringToObject(value) {
        return value
            .replace(/^\?/, '')
            .split('&')
            .reduce((acc, val) => {
            const [key, value] = val.split('=');
            if (key.length > 0) {
                acc[key] = decodeURIComponent(value || '');
            }
            return acc;
        }, {});
    }
    URLExt.queryStringToObject = queryStringToObject;
    /**
     * Test whether the url is a local url.
     *
     * #### Notes
     * This function returns `false` for any fully qualified url, including
     * `data:`, `file:`, and `//` protocol URLs.
     */
    function isLocal(url) {
        const { protocol } = parse(url);
        return url.toLowerCase().indexOf(protocol) !== 0 && url.indexOf('/') !== 0;
    }
    URLExt.isLocal = isLocal;
})(URLExt = exports.URLExt || (exports.URLExt = {}));
//# sourceMappingURL=url.js.map