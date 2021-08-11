'use strict';

var pair = require('./pair-ab022bc3.cjs');
var map = require('./map-28a001c9.cjs');

/* eslint-env browser */

/* istanbul ignore next */
/**
 * @type {Document}
 */
const doc = /** @type {Document} */ (typeof document !== 'undefined' ? document : {});

/**
 * @param {string} name
 * @return {HTMLElement}
 */
/* istanbul ignore next */
const createElement = name => doc.createElement(name);

/**
 * @return {DocumentFragment}
 */
/* istanbul ignore next */
const createDocumentFragment = () => doc.createDocumentFragment();

/**
 * @param {string} text
 * @return {Text}
 */
/* istanbul ignore next */
const createTextNode = text => doc.createTextNode(text);

/* istanbul ignore next */
const domParser = /** @type {DOMParser} */ (typeof DOMParser !== 'undefined' ? new DOMParser() : null);

/**
 * @param {HTMLElement} el
 * @param {string} name
 * @param {Object} opts
 */
/* istanbul ignore next */
const emitCustomEvent = (el, name, opts) => el.dispatchEvent(new CustomEvent(name, opts));

/**
 * @param {Element} el
 * @param {Array<pair.Pair<string,string|boolean>>} attrs Array of key-value pairs
 * @return {Element}
 */
/* istanbul ignore next */
const setAttributes = (el, attrs) => {
  pair.forEach(attrs, (key, value) => {
    if (value === false) {
      el.removeAttribute(key);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      // @ts-ignore
      el.setAttribute(key, value);
    }
  });
  return el
};

/**
 * @param {Element} el
 * @param {Map<string, string>} attrs Array of key-value pairs
 * @return {Element}
 */
/* istanbul ignore next */
const setAttributesMap = (el, attrs) => {
  attrs.forEach((value, key) => { el.setAttribute(key, value); });
  return el
};

/**
 * @param {Array<Node>|HTMLCollection} children
 * @return {DocumentFragment}
 */
/* istanbul ignore next */
const fragment = children => {
  const fragment = createDocumentFragment();
  for (let i = 0; i < children.length; i++) {
    appendChild(fragment, children[i]);
  }
  return fragment
};

/**
 * @param {Element} parent
 * @param {Array<Node>} nodes
 * @return {Element}
 */
/* istanbul ignore next */
const append = (parent, nodes) => {
  appendChild(parent, fragment(nodes));
  return parent
};

/**
 * @param {HTMLElement} el
 */
/* istanbul ignore next */
const remove = el => el.remove();

/**
 * @param {EventTarget} el
 * @param {string} name
 * @param {EventListener} f
 */
/* istanbul ignore next */
const addEventListener = (el, name, f) => el.addEventListener(name, f);

/**
 * @param {EventTarget} el
 * @param {string} name
 * @param {EventListener} f
 */
/* istanbul ignore next */
const removeEventListener = (el, name, f) => el.removeEventListener(name, f);

/**
 * @param {Node} node
 * @param {Array<pair.Pair<string,EventListener>>} listeners
 * @return {Node}
 */
/* istanbul ignore next */
const addEventListeners = (node, listeners) => {
  pair.forEach(listeners, (name, f) => addEventListener(node, name, f));
  return node
};

/**
 * @param {Node} node
 * @param {Array<pair.Pair<string,EventListener>>} listeners
 * @return {Node}
 */
/* istanbul ignore next */
const removeEventListeners = (node, listeners) => {
  pair.forEach(listeners, (name, f) => removeEventListener(node, name, f));
  return node
};

/**
 * @param {string} name
 * @param {Array<pair.Pair<string,string>|pair.Pair<string,boolean>>} attrs Array of key-value pairs
 * @param {Array<Node>} children
 * @return {Element}
 */
/* istanbul ignore next */
const element = (name, attrs = [], children = []) =>
  append(setAttributes(createElement(name), attrs), children);

/**
 * @param {number} width
 * @param {number} height
 */
/* istanbul ignore next */
const canvas = (width, height) => {
  const c = /** @type {HTMLCanvasElement} */ (createElement('canvas'));
  c.height = height;
  c.width = width;
  return c
};

/**
 * @param {string} t
 * @return {Text}
 */
/* istanbul ignore next */
const text = createTextNode;

/**
 * @param {pair.Pair<string,string>} pair
 */
/* istanbul ignore next */
const pairToStyleString = pair => `${pair.left}:${pair.right};`;

/**
 * @param {Array<pair.Pair<string,string>>} pairs
 * @return {string}
 */
/* istanbul ignore next */
const pairsToStyleString = pairs => pairs.map(pairToStyleString).join('');

/**
 * @param {Map<string,string>} m
 * @return {string}
 */
/* istanbul ignore next */
const mapToStyleString = m => map.map(m, (value, key) => `${key}:${value};`).join('');

/**
 * @todo should always query on a dom element
 *
 * @param {HTMLElement|ShadowRoot} el
 * @param {string} query
 * @return {HTMLElement | null}
 */
/* istanbul ignore next */
const querySelector = (el, query) => el.querySelector(query);

/**
 * @param {HTMLElement|ShadowRoot} el
 * @param {string} query
 * @return {NodeListOf<HTMLElement>}
 */
/* istanbul ignore next */
const querySelectorAll = (el, query) => el.querySelectorAll(query);

/**
 * @param {string} id
 * @return {HTMLElement}
 */
/* istanbul ignore next */
const getElementById = id => /** @type {HTMLElement} */ (doc.getElementById(id));

/**
 * @param {string} html
 * @return {HTMLElement}
 */
/* istanbul ignore next */
const _parse = html => domParser.parseFromString(`<html><body>${html}</body></html>`, 'text/html').body;

/**
 * @param {string} html
 * @return {DocumentFragment}
 */
/* istanbul ignore next */
const parseFragment = html => fragment(/** @type {any} */ (_parse(html).childNodes));

/**
 * @param {string} html
 * @return {HTMLElement}
 */
/* istanbul ignore next */
const parseElement = html => /** @type HTMLElement */ (_parse(html).firstElementChild);

/**
 * @param {HTMLElement} oldEl
 * @param {HTMLElement|DocumentFragment} newEl
 */
/* istanbul ignore next */
const replaceWith = (oldEl, newEl) => oldEl.replaceWith(newEl);

/**
 * @param {HTMLElement} parent
 * @param {HTMLElement} el
 * @param {Node|null} ref
 * @return {HTMLElement}
 */
/* istanbul ignore next */
const insertBefore = (parent, el, ref) => parent.insertBefore(el, ref);

/**
 * @param {Node} parent
 * @param {Node} child
 * @return {Node}
 */
/* istanbul ignore next */
const appendChild = (parent, child) => parent.appendChild(child);

const ELEMENT_NODE = doc.ELEMENT_NODE;
const TEXT_NODE = doc.TEXT_NODE;
const CDATA_SECTION_NODE = doc.CDATA_SECTION_NODE;
const COMMENT_NODE = doc.COMMENT_NODE;
const DOCUMENT_NODE = doc.DOCUMENT_NODE;
const DOCUMENT_TYPE_NODE = doc.DOCUMENT_TYPE_NODE;
const DOCUMENT_FRAGMENT_NODE = doc.DOCUMENT_FRAGMENT_NODE;

/**
 * @param {any} node
 * @param {number} type
 */
const checkNodeType = (node, type) => node.nodeType === type;

/**
 * @param {Node} parent
 * @param {HTMLElement} child
 */
const isParentOf = (parent, child) => {
  let p = child.parentNode;
  while (p && p !== parent) {
    p = p.parentNode;
  }
  return p === parent
};

var dom = /*#__PURE__*/Object.freeze({
  __proto__: null,
  doc: doc,
  createElement: createElement,
  createDocumentFragment: createDocumentFragment,
  createTextNode: createTextNode,
  domParser: domParser,
  emitCustomEvent: emitCustomEvent,
  setAttributes: setAttributes,
  setAttributesMap: setAttributesMap,
  fragment: fragment,
  append: append,
  remove: remove,
  addEventListener: addEventListener,
  removeEventListener: removeEventListener,
  addEventListeners: addEventListeners,
  removeEventListeners: removeEventListeners,
  element: element,
  canvas: canvas,
  text: text,
  pairToStyleString: pairToStyleString,
  pairsToStyleString: pairsToStyleString,
  mapToStyleString: mapToStyleString,
  querySelector: querySelector,
  querySelectorAll: querySelectorAll,
  getElementById: getElementById,
  parseFragment: parseFragment,
  parseElement: parseElement,
  replaceWith: replaceWith,
  insertBefore: insertBefore,
  appendChild: appendChild,
  ELEMENT_NODE: ELEMENT_NODE,
  TEXT_NODE: TEXT_NODE,
  CDATA_SECTION_NODE: CDATA_SECTION_NODE,
  COMMENT_NODE: COMMENT_NODE,
  DOCUMENT_NODE: DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE: DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE: DOCUMENT_FRAGMENT_NODE,
  checkNodeType: checkNodeType,
  isParentOf: isParentOf
});

exports.CDATA_SECTION_NODE = CDATA_SECTION_NODE;
exports.COMMENT_NODE = COMMENT_NODE;
exports.DOCUMENT_FRAGMENT_NODE = DOCUMENT_FRAGMENT_NODE;
exports.DOCUMENT_NODE = DOCUMENT_NODE;
exports.DOCUMENT_TYPE_NODE = DOCUMENT_TYPE_NODE;
exports.ELEMENT_NODE = ELEMENT_NODE;
exports.TEXT_NODE = TEXT_NODE;
exports.addEventListener = addEventListener;
exports.addEventListeners = addEventListeners;
exports.append = append;
exports.appendChild = appendChild;
exports.canvas = canvas;
exports.checkNodeType = checkNodeType;
exports.createDocumentFragment = createDocumentFragment;
exports.createElement = createElement;
exports.createTextNode = createTextNode;
exports.doc = doc;
exports.dom = dom;
exports.domParser = domParser;
exports.element = element;
exports.emitCustomEvent = emitCustomEvent;
exports.fragment = fragment;
exports.getElementById = getElementById;
exports.insertBefore = insertBefore;
exports.isParentOf = isParentOf;
exports.mapToStyleString = mapToStyleString;
exports.pairToStyleString = pairToStyleString;
exports.pairsToStyleString = pairsToStyleString;
exports.parseElement = parseElement;
exports.parseFragment = parseFragment;
exports.querySelector = querySelector;
exports.querySelectorAll = querySelectorAll;
exports.remove = remove;
exports.removeEventListener = removeEventListener;
exports.removeEventListeners = removeEventListeners;
exports.replaceWith = replaceWith;
exports.setAttributes = setAttributes;
exports.setAttributesMap = setAttributesMap;
exports.text = text;
//# sourceMappingURL=dom-58958c04.cjs.map
