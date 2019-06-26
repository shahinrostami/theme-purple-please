"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ansi_up_1 = __importDefault(require("ansi_up"));
const marked_1 = __importDefault(require("marked"));
const codemirror_1 = require("@jupyterlab/codemirror");
const coreutils_1 = require("@jupyterlab/coreutils");
const algorithm_1 = require("@phosphor/algorithm");
const latex_1 = require("./latex");
/**
 * Render HTML into a host node.
 *
 * @params options - The options for rendering.
 *
 * @returns A promise which resolves when rendering is complete.
 */
function renderHTML(options) {
    // Unpack the options.
    let { host, source, trusted, sanitizer, resolver, linkHandler, shouldTypeset, latexTypesetter } = options;
    let originalSource = source;
    // Bail early if the source is empty.
    if (!source) {
        host.textContent = '';
        return Promise.resolve(undefined);
    }
    // Sanitize the source if it is not trusted. This removes all
    // `<script>` tags as well as other potentially harmful HTML.
    if (!trusted) {
        originalSource = `${source}`;
        source = sanitizer.sanitize(source);
    }
    // Set the inner HTML of the host.
    host.innerHTML = source;
    if (host.getElementsByTagName('script').length > 0) {
        // If output it trusted, eval any script tags contained in the HTML.
        // This is not done automatically by the browser when script tags are
        // created by setting `innerHTML`.
        if (trusted) {
            Private.evalInnerHTMLScriptTags(host);
        }
        else {
            const container = document.createElement('div');
            const warning = document.createElement('pre');
            warning.textContent =
                'This HTML output contains inline scripts. Are you sure that you want to run arbitrary Javascript within your JupyterLab session?';
            const runButton = document.createElement('button');
            runButton.textContent = 'Run';
            runButton.onclick = event => {
                host.innerHTML = originalSource;
                Private.evalInnerHTMLScriptTags(host);
                host.removeChild(host.firstChild);
            };
            container.appendChild(warning);
            container.appendChild(runButton);
            host.insertBefore(container, host.firstChild);
        }
    }
    // Handle default behavior of nodes.
    Private.handleDefaults(host, resolver);
    // Patch the urls if a resolver is available.
    let promise;
    if (resolver) {
        promise = Private.handleUrls(host, resolver, linkHandler);
    }
    else {
        promise = Promise.resolve(undefined);
    }
    // Return the final rendered promise.
    return promise.then(() => {
        if (shouldTypeset && latexTypesetter) {
            latexTypesetter.typeset(host);
        }
    });
}
exports.renderHTML = renderHTML;
/**
 * Render an image into a host node.
 *
 * @params options - The options for rendering.
 *
 * @returns A promise which resolves when rendering is complete.
 */
function renderImage(options) {
    // Unpack the options.
    let { host, mimeType, source, width, height, needsBackground, unconfined } = options;
    // Clear the content in the host.
    host.textContent = '';
    // Create the image element.
    let img = document.createElement('img');
    // Set the source of the image.
    img.src = `data:${mimeType};base64,${source}`;
    // Set the size of the image if provided.
    if (typeof height === 'number') {
        img.height = height;
    }
    if (typeof width === 'number') {
        img.width = width;
    }
    if (needsBackground === 'light') {
        img.classList.add('jp-needs-light-background');
    }
    else if (needsBackground === 'dark') {
        img.classList.add('jp-needs-dark-background');
    }
    if (unconfined === true) {
        img.classList.add('jp-mod-unconfined');
    }
    // Add the image to the host.
    host.appendChild(img);
    // Return the rendered promise.
    return Promise.resolve(undefined);
}
exports.renderImage = renderImage;
/**
 * Render LaTeX into a host node.
 *
 * @params options - The options for rendering.
 *
 * @returns A promise which resolves when rendering is complete.
 */
function renderLatex(options) {
    // Unpack the options.
    let { host, source, shouldTypeset, latexTypesetter } = options;
    // Set the source on the node.
    host.textContent = source;
    // Typeset the node if needed.
    if (shouldTypeset && latexTypesetter) {
        latexTypesetter.typeset(host);
    }
    // Return the rendered promise.
    return Promise.resolve(undefined);
}
exports.renderLatex = renderLatex;
/**
 * Render Markdown into a host node.
 *
 * @params options - The options for rendering.
 *
 * @returns A promise which resolves when rendering is complete.
 */
function renderMarkdown(options) {
    // Unpack the options.
    let { host, source, trusted, sanitizer, resolver, linkHandler, latexTypesetter, shouldTypeset } = options;
    // Clear the content if there is no source.
    if (!source) {
        host.textContent = '';
        return Promise.resolve(undefined);
    }
    // Separate math from normal markdown text.
    let parts = latex_1.removeMath(source);
    // Render the markdown and handle sanitization.
    return Private.renderMarked(parts['text'])
        .then(content => {
        // Restore the math content in the rendered markdown.
        content = latex_1.replaceMath(content, parts['math']);
        let originalContent = content;
        // Sanitize the content it is not trusted.
        if (!trusted) {
            originalContent = `${content}`;
            content = sanitizer.sanitize(content);
        }
        // Set the inner HTML of the host.
        host.innerHTML = content;
        if (host.getElementsByTagName('script').length > 0) {
            // If output it trusted, eval any script tags contained in the HTML.
            // This is not done automatically by the browser when script tags are
            // created by setting `innerHTML`.
            if (trusted) {
                Private.evalInnerHTMLScriptTags(host);
            }
            else {
                const container = document.createElement('div');
                const warning = document.createElement('pre');
                warning.textContent =
                    'This HTML output contains inline scripts. Are you sure that you want to run arbitrary Javascript within your JupyterLab session?';
                const runButton = document.createElement('button');
                runButton.textContent = 'Run';
                runButton.onclick = event => {
                    host.innerHTML = originalContent;
                    Private.evalInnerHTMLScriptTags(host);
                    host.removeChild(host.firstChild);
                };
                container.appendChild(warning);
                container.appendChild(runButton);
                host.insertBefore(container, host.firstChild);
            }
        }
        // Handle default behavior of nodes.
        Private.handleDefaults(host, resolver);
        // Apply ids to the header nodes.
        Private.headerAnchors(host);
        // Patch the urls if a resolver is available.
        let promise;
        if (resolver) {
            promise = Private.handleUrls(host, resolver, linkHandler);
        }
        else {
            promise = Promise.resolve(undefined);
        }
        // Return the rendered promise.
        return promise;
    })
        .then(() => {
        if (shouldTypeset && latexTypesetter) {
            latexTypesetter.typeset(host);
        }
    });
}
exports.renderMarkdown = renderMarkdown;
/**
 * Render SVG into a host node.
 *
 * @params options - The options for rendering.
 *
 * @returns A promise which resolves when rendering is complete.
 */
function renderSVG(options) {
    // Unpack the options.
    let { host, source, trusted, unconfined } = options;
    // Clear the content if there is no source.
    if (!source) {
        host.textContent = '';
        return Promise.resolve(undefined);
    }
    // Display a message if the source is not trusted.
    if (!trusted) {
        host.textContent =
            'Cannot display an untrusted SVG. Maybe you need to run the cell?';
        return Promise.resolve(undefined);
    }
    // Render in img so that user can save it easily
    const img = new Image();
    img.src = `data:image/svg+xml,${encodeURIComponent(source)}`;
    host.appendChild(img);
    if (unconfined === true) {
        host.classList.add('jp-mod-unconfined');
    }
    return Promise.resolve();
}
exports.renderSVG = renderSVG;
/**
 * Render text into a host node.
 *
 * @params options - The options for rendering.
 *
 * @returns A promise which resolves when rendering is complete.
 */
function renderText(options) {
    // Unpack the options.
    let { host, source } = options;
    const ansiUp = new ansi_up_1.default();
    ansiUp.escape_for_html = true;
    ansiUp.use_classes = true;
    // Create the HTML content.
    let content = ansiUp.ansi_to_html(source);
    // Set the inner HTML for the host node.
    host.innerHTML = `<pre>${content}</pre>`;
    // Return the rendered promise.
    return Promise.resolve(undefined);
}
exports.renderText = renderText;
/**
 * The namespace for module implementation details.
 */
var Private;
(function (Private) {
    /**
     * Eval the script tags contained in a host populated by `innerHTML`.
     *
     * When script tags are created via `innerHTML`, the browser does not
     * evaluate them when they are added to the page. This function works
     * around that by creating new equivalent script nodes manually, and
     * replacing the originals.
     */
    function evalInnerHTMLScriptTags(host) {
        // Create a snapshot of the current script nodes.
        let scripts = algorithm_1.toArray(host.getElementsByTagName('script'));
        // Loop over each script node.
        for (let script of scripts) {
            // Skip any scripts which no longer have a parent.
            if (!script.parentNode) {
                continue;
            }
            // Create a new script node which will be clone.
            let clone = document.createElement('script');
            // Copy the attributes into the clone.
            let attrs = script.attributes;
            for (let i = 0, n = attrs.length; i < n; ++i) {
                let { name, value } = attrs[i];
                clone.setAttribute(name, value);
            }
            // Copy the text content into the clone.
            clone.textContent = script.textContent;
            // Replace the old script in the parent.
            script.parentNode.replaceChild(clone, script);
        }
    }
    Private.evalInnerHTMLScriptTags = evalInnerHTMLScriptTags;
    /**
     * Render markdown for the specified content.
     *
     * @param content - The string of markdown to render.
     *
     * @return A promise which resolves with the rendered content.
     */
    function renderMarked(content) {
        initializeMarked();
        return new Promise((resolve, reject) => {
            marked_1.default(content, (err, content) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(content);
                }
            });
        });
    }
    Private.renderMarked = renderMarked;
    /**
     * Handle the default behavior of nodes.
     */
    function handleDefaults(node, resolver) {
        // Handle anchor elements.
        let anchors = node.getElementsByTagName('a');
        for (let i = 0; i < anchors.length; i++) {
            let path = anchors[i].href || '';
            const isLocal = resolver && resolver.isLocal
                ? resolver.isLocal(path)
                : coreutils_1.URLExt.isLocal(path);
            if (isLocal) {
                anchors[i].target = '_self';
            }
            else {
                anchors[i].target = '_blank';
            }
        }
        // Handle image elements.
        let imgs = node.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
            if (!imgs[i].alt) {
                imgs[i].alt = 'Image';
            }
        }
    }
    Private.handleDefaults = handleDefaults;
    /**
     * Resolve the relative urls in element `src` and `href` attributes.
     *
     * @param node - The head html element.
     *
     * @param resolver - A url resolver.
     *
     * @param linkHandler - An optional link handler for nodes.
     *
     * @returns a promise fulfilled when the relative urls have been resolved.
     */
    function handleUrls(node, resolver, linkHandler) {
        // Set up an array to collect promises.
        let promises = [];
        // Handle HTML Elements with src attributes.
        let nodes = node.querySelectorAll('*[src]');
        for (let i = 0; i < nodes.length; i++) {
            promises.push(handleAttr(nodes[i], 'src', resolver));
        }
        // Handle anchor elements.
        let anchors = node.getElementsByTagName('a');
        for (let i = 0; i < anchors.length; i++) {
            promises.push(handleAnchor(anchors[i], resolver, linkHandler));
        }
        // Handle link elements.
        let links = node.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
            promises.push(handleAttr(links[i], 'href', resolver));
        }
        // Wait on all promises.
        return Promise.all(promises).then(() => undefined);
    }
    Private.handleUrls = handleUrls;
    /**
     * Apply ids to headers.
     */
    function headerAnchors(node) {
        let headerNames = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        for (let headerType of headerNames) {
            let headers = node.getElementsByTagName(headerType);
            for (let i = 0; i < headers.length; i++) {
                let header = headers[i];
                header.id = encodeURIComponent(header.innerHTML.replace(/ /g, '-'));
                let anchor = document.createElement('a');
                anchor.target = '_self';
                anchor.textContent = '¶';
                anchor.href = '#' + header.id;
                anchor.classList.add('jp-InternalAnchorLink');
                header.appendChild(anchor);
            }
        }
    }
    Private.headerAnchors = headerAnchors;
    /**
     * Handle a node with a `src` or `href` attribute.
     */
    function handleAttr(node, name, resolver) {
        let source = node.getAttribute(name) || '';
        const isLocal = resolver.isLocal
            ? resolver.isLocal(source)
            : coreutils_1.URLExt.isLocal(source);
        if (!source || !isLocal) {
            return Promise.resolve(undefined);
        }
        node.setAttribute(name, '');
        return resolver
            .resolveUrl(source)
            .then(urlPath => {
            return resolver.getDownloadUrl(urlPath);
        })
            .then(url => {
            // Check protocol again in case it changed:
            if (coreutils_1.URLExt.parse(url).protocol !== 'data:') {
                // Bust caching for local src attrs.
                // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
                url += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
            }
            node.setAttribute(name, url);
        })
            .catch(err => {
            // If there was an error getting the url,
            // just make it an empty link.
            node.setAttribute(name, '');
        });
    }
    /**
     * Handle an anchor node.
     */
    function handleAnchor(anchor, resolver, linkHandler) {
        // Get the link path without the location prepended.
        // (e.g. "./foo.md#Header 1" vs "http://localhost:8888/foo.md#Header 1")
        let href = anchor.getAttribute('href') || '';
        const isLocal = resolver.isLocal
            ? resolver.isLocal(href)
            : coreutils_1.URLExt.isLocal(href);
        // Bail if it is not a file-like url.
        if (!href || !isLocal) {
            return Promise.resolve(undefined);
        }
        // Remove the hash until we can handle it.
        let hash = anchor.hash;
        if (hash) {
            // Handle internal link in the file.
            if (hash === href) {
                anchor.target = '_self';
                return Promise.resolve(undefined);
            }
            // For external links, remove the hash until we have hash handling.
            href = href.replace(hash, '');
        }
        // Get the appropriate file path.
        return resolver
            .resolveUrl(href)
            .then(urlPath => {
            // decode encoded url from url to api path
            const path = decodeURI(urlPath);
            // Handle the click override.
            if (linkHandler) {
                linkHandler.handleLink(anchor, path, hash);
            }
            // Get the appropriate file download path.
            return resolver.getDownloadUrl(urlPath);
        })
            .then(url => {
            // Set the visible anchor.
            anchor.href = url + hash;
        })
            .catch(err => {
            // If there was an error getting the url,
            // just make it an empty link.
            anchor.href = '';
        });
    }
    let markedInitialized = false;
    /**
     * Support GitHub flavored Markdown, leave sanitizing to external library.
     */
    function initializeMarked() {
        if (markedInitialized) {
            return;
        }
        markedInitialized = true;
        marked_1.default.setOptions({
            gfm: true,
            sanitize: false,
            tables: true,
            // breaks: true; We can't use GFM breaks as it causes problems with tables
            langPrefix: `cm-s-${codemirror_1.CodeMirrorEditor.defaultConfig.theme} language-`,
            highlight: (code, lang, callback) => {
                let cb = (err, code) => {
                    if (callback) {
                        callback(err, code);
                    }
                    return code;
                };
                if (!lang) {
                    // no language, no highlight
                    return cb(null, code);
                }
                codemirror_1.Mode.ensure(lang)
                    .then(spec => {
                    let el = document.createElement('div');
                    if (!spec) {
                        console.log(`No CodeMirror mode: ${lang}`);
                        return cb(null, code);
                    }
                    try {
                        codemirror_1.Mode.run(code, spec.mime, el);
                        return cb(null, el.innerHTML);
                    }
                    catch (err) {
                        console.log(`Failed to highlight ${lang} code`, err);
                        return cb(err, code);
                    }
                })
                    .catch(err => {
                    console.log(`No CodeMirror mode: ${lang}`);
                    console.log(`Require CodeMirror mode error: ${err}`);
                    return cb(null, code);
                });
                return code;
            }
        });
    }
})(Private || (Private = {}));
