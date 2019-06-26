"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const widgets = __importStar(require("./widgets"));
/**
 * A mime renderer factory for raw html.
 */
exports.htmlRendererFactory = {
    safe: true,
    mimeTypes: ['text/html'],
    defaultRank: 50,
    createRenderer: options => new widgets.RenderedHTML(options)
};
/**
 * A mime renderer factory for images.
 */
exports.imageRendererFactory = {
    safe: true,
    mimeTypes: ['image/bmp', 'image/png', 'image/jpeg', 'image/gif'],
    defaultRank: 90,
    createRenderer: options => new widgets.RenderedImage(options)
};
/**
 * A mime renderer factory for LaTeX.
 */
exports.latexRendererFactory = {
    safe: true,
    mimeTypes: ['text/latex'],
    defaultRank: 70,
    createRenderer: options => new widgets.RenderedLatex(options)
};
/**
 * A mime renderer factory for Markdown.
 */
exports.markdownRendererFactory = {
    safe: true,
    mimeTypes: ['text/markdown'],
    defaultRank: 60,
    createRenderer: options => new widgets.RenderedMarkdown(options)
};
/**
 * A mime renderer factory for svg.
 */
exports.svgRendererFactory = {
    safe: false,
    mimeTypes: ['image/svg+xml'],
    defaultRank: 80,
    createRenderer: options => new widgets.RenderedSVG(options)
};
/**
 * A mime renderer factory for plain and jupyter console text data.
 */
exports.textRendererFactory = {
    safe: true,
    mimeTypes: [
        'text/plain',
        'application/vnd.jupyter.stdout',
        'application/vnd.jupyter.stderr'
    ],
    defaultRank: 120,
    createRenderer: options => new widgets.RenderedText(options)
};
/**
 * A placeholder factory for deprecated rendered JavaScript.
 */
exports.javaScriptRendererFactory = {
    safe: false,
    mimeTypes: ['text/javascript', 'application/javascript'],
    defaultRank: 110,
    createRenderer: options => new widgets.RenderedJavaScript(options)
};
/**
 * The standard factories provided by the rendermime package.
 */
exports.standardRendererFactories = [
    exports.htmlRendererFactory,
    exports.markdownRendererFactory,
    exports.latexRendererFactory,
    exports.svgRendererFactory,
    exports.imageRendererFactory,
    exports.javaScriptRendererFactory,
    exports.textRendererFactory
];
