"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
const renderers = __importStar(require("./renderers"));
/**
 * A common base class for mime renderers.
 */
class RenderedCommon extends widgets_1.Widget {
    /**
     * Construct a new rendered common widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super();
        this.mimeType = options.mimeType;
        this.sanitizer = options.sanitizer;
        this.resolver = options.resolver;
        this.linkHandler = options.linkHandler;
        this.latexTypesetter = options.latexTypesetter;
        this.node.dataset['mimeType'] = this.mimeType;
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    renderModel(model) {
        // TODO compare model against old model for early bail?
        // Toggle the trusted class on the widget.
        this.toggleClass('jp-mod-trusted', model.trusted);
        // Render the actual content.
        return this.render(model);
    }
}
exports.RenderedCommon = RenderedCommon;
/**
 * A common base class for HTML mime renderers.
 */
class RenderedHTMLCommon extends RenderedCommon {
    /**
     * Construct a new rendered HTML common widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedHTMLCommon');
    }
}
exports.RenderedHTMLCommon = RenderedHTMLCommon;
/**
 * A mime renderer for displaying HTML and math.
 */
class RenderedHTML extends RenderedHTMLCommon {
    /**
     * Construct a new rendered HTML widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedHTML');
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    render(model) {
        return renderers.renderHTML({
            host: this.node,
            source: String(model.data[this.mimeType]),
            trusted: model.trusted,
            resolver: this.resolver,
            sanitizer: this.sanitizer,
            linkHandler: this.linkHandler,
            shouldTypeset: this.isAttached,
            latexTypesetter: this.latexTypesetter
        });
    }
    /**
     * A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        if (this.latexTypesetter) {
            this.latexTypesetter.typeset(this.node);
        }
    }
}
exports.RenderedHTML = RenderedHTML;
/**
 * A mime renderer for displaying LaTeX output.
 */
class RenderedLatex extends RenderedCommon {
    /**
     * Construct a new rendered LaTeX widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedLatex');
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    render(model) {
        return renderers.renderLatex({
            host: this.node,
            source: String(model.data[this.mimeType]),
            shouldTypeset: this.isAttached,
            latexTypesetter: this.latexTypesetter
        });
    }
    /**
     * A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        if (this.latexTypesetter) {
            this.latexTypesetter.typeset(this.node);
        }
    }
}
exports.RenderedLatex = RenderedLatex;
/**
 * A mime renderer for displaying images.
 */
class RenderedImage extends RenderedCommon {
    /**
     * Construct a new rendered image widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedImage');
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    render(model) {
        let metadata = model.metadata[this.mimeType];
        return renderers.renderImage({
            host: this.node,
            mimeType: this.mimeType,
            source: String(model.data[this.mimeType]),
            width: metadata && metadata.width,
            height: metadata && metadata.height,
            needsBackground: model.metadata['needs_background'],
            unconfined: metadata && metadata.unconfined
        });
    }
}
exports.RenderedImage = RenderedImage;
/**
 * A mime renderer for displaying Markdown with embedded latex.
 */
class RenderedMarkdown extends RenderedHTMLCommon {
    /**
     * Construct a new rendered markdown widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedMarkdown');
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    render(model) {
        return renderers.renderMarkdown({
            host: this.node,
            source: String(model.data[this.mimeType]),
            trusted: model.trusted,
            resolver: this.resolver,
            sanitizer: this.sanitizer,
            linkHandler: this.linkHandler,
            shouldTypeset: this.isAttached,
            latexTypesetter: this.latexTypesetter
        });
    }
    /**
     * A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        if (this.latexTypesetter) {
            this.latexTypesetter.typeset(this.node);
        }
    }
}
exports.RenderedMarkdown = RenderedMarkdown;
/**
 * A widget for displaying SVG content.
 */
class RenderedSVG extends RenderedCommon {
    /**
     * Construct a new rendered SVG widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedSVG');
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    render(model) {
        let metadata = model.metadata[this.mimeType];
        return renderers.renderSVG({
            host: this.node,
            source: String(model.data[this.mimeType]),
            trusted: model.trusted,
            unconfined: metadata && metadata.unconfined
        });
    }
    /**
     * A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        if (this.latexTypesetter) {
            this.latexTypesetter.typeset(this.node);
        }
    }
}
exports.RenderedSVG = RenderedSVG;
/**
 * A widget for displaying plain text and console text.
 */
class RenderedText extends RenderedCommon {
    /**
     * Construct a new rendered text widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedText');
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    render(model) {
        return renderers.renderText({
            host: this.node,
            source: String(model.data[this.mimeType])
        });
    }
}
exports.RenderedText = RenderedText;
/**
 * A widget for displaying deprecated JavaScript output.
 */
class RenderedJavaScript extends RenderedCommon {
    /**
     * Construct a new rendered text widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this.addClass('jp-RenderedJavaScript');
    }
    /**
     * Render a mime model.
     *
     * @param model - The mime model to render.
     *
     * @returns A promise which resolves when rendering is complete.
     */
    render(model) {
        return renderers.renderText({
            host: this.node,
            source: 'JavaScript output is disabled in JupyterLab'
        });
    }
}
exports.RenderedJavaScript = RenderedJavaScript;
