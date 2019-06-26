"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_2 = require("@phosphor/coreutils");
const mimemodel_1 = require("./mimemodel");
/* tslint:disable */
/**
 * The rendermime token.
 */
exports.IRenderMimeRegistry = new coreutils_2.Token('@jupyterlab/rendermime:IRenderMimeRegistry');
/* tslint:enable */
/* tslint:disable */
/**
 * The latex typesetter token.
 */
exports.ILatexTypesetter = new coreutils_2.Token('@jupyterlab/rendermime:ILatexTypesetter');
/* tslint:enable */
/**
 * An object which manages mime renderer factories.
 *
 * This object is used to render mime models using registered mime
 * renderers, selecting the preferred mime renderer to render the
 * model into a widget.
 *
 * #### Notes
 * This class is not intended to be subclassed.
 */
class RenderMimeRegistry {
    /**
     * Construct a new rendermime.
     *
     * @param options - The options for initializing the instance.
     */
    constructor(options = {}) {
        this._id = 0;
        this._ranks = {};
        this._types = null;
        this._factories = {};
        // Parse the options.
        this.resolver = options.resolver || null;
        this.linkHandler = options.linkHandler || null;
        this.latexTypesetter = options.latexTypesetter || null;
        this.sanitizer = options.sanitizer || apputils_1.defaultSanitizer;
        // Add the initial factories.
        if (options.initialFactories) {
            for (let factory of options.initialFactories) {
                this.addFactory(factory);
            }
        }
    }
    /**
     * The ordered list of mimeTypes.
     */
    get mimeTypes() {
        return this._types || (this._types = Private.sortedTypes(this._ranks));
    }
    /**
     * Find the preferred mime type for a mime bundle.
     *
     * @param bundle - The bundle of mime data.
     *
     * @param safe - How to consider safe/unsafe factories. If 'ensure',
     *   it will only consider safe factories. If 'any', any factory will be
     *   considered. If 'prefer', unsafe factories will be considered, but
     *   only after the safe options have been exhausted.
     *
     * @returns The preferred mime type from the available factories,
     *   or `undefined` if the mime type cannot be rendered.
     */
    preferredMimeType(bundle, safe = 'ensure') {
        // Try to find a safe factory first, if preferred.
        if (safe === 'ensure' || safe === 'prefer') {
            for (let mt of this.mimeTypes) {
                if (mt in bundle && this._factories[mt].safe) {
                    return mt;
                }
            }
        }
        if (safe !== 'ensure') {
            // Otherwise, search for the best factory among all factories.
            for (let mt of this.mimeTypes) {
                if (mt in bundle) {
                    return mt;
                }
            }
        }
        // Otherwise, no matching mime type exists.
        return undefined;
    }
    /**
     * Create a renderer for a mime type.
     *
     * @param mimeType - The mime type of interest.
     *
     * @returns A new renderer for the given mime type.
     *
     * @throws An error if no factory exists for the mime type.
     */
    createRenderer(mimeType) {
        // Throw an error if no factory exists for the mime type.
        if (!(mimeType in this._factories)) {
            throw new Error(`No factory for mime type: '${mimeType}'`);
        }
        // Invoke the best factory for the given mime type.
        return this._factories[mimeType].createRenderer({
            mimeType,
            resolver: this.resolver,
            sanitizer: this.sanitizer,
            linkHandler: this.linkHandler,
            latexTypesetter: this.latexTypesetter
        });
    }
    /**
     * Create a new mime model.  This is a convenience method.
     *
     * @options - The options used to create the model.
     *
     * @returns A new mime model.
     */
    createModel(options = {}) {
        return new mimemodel_1.MimeModel(options);
    }
    /**
     * Create a clone of this rendermime instance.
     *
     * @param options - The options for configuring the clone.
     *
     * @returns A new independent clone of the rendermime.
     */
    clone(options = {}) {
        // Create the clone.
        let clone = new RenderMimeRegistry({
            resolver: options.resolver || this.resolver || undefined,
            sanitizer: options.sanitizer || this.sanitizer || undefined,
            linkHandler: options.linkHandler || this.linkHandler || undefined,
            latexTypesetter: options.latexTypesetter || this.latexTypesetter
        });
        // Clone the internal state.
        clone._factories = Object.assign({}, this._factories);
        clone._ranks = Object.assign({}, this._ranks);
        clone._id = this._id;
        // Return the cloned object.
        return clone;
    }
    /**
     * Get the renderer factory registered for a mime type.
     *
     * @param mimeType - The mime type of interest.
     *
     * @returns The factory for the mime type, or `undefined`.
     */
    getFactory(mimeType) {
        return this._factories[mimeType];
    }
    /**
     * Add a renderer factory to the rendermime.
     *
     * @param factory - The renderer factory of interest.
     *
     * @param rank - The rank of the renderer. A lower rank indicates
     *   a higher priority for rendering. If not given, the rank will
     *   defer to the `defaultRank` of the factory.  If no `defaultRank`
     *   is given, it will default to 100.
     *
     * #### Notes
     * The renderer will replace an existing renderer for the given
     * mimeType.
     */
    addFactory(factory, rank) {
        if (rank === undefined) {
            rank = factory.defaultRank;
            if (rank === undefined) {
                rank = 100;
            }
        }
        for (let mt of factory.mimeTypes) {
            this._factories[mt] = factory;
            this._ranks[mt] = { rank, id: this._id++ };
        }
        this._types = null;
    }
    /**
     * Remove a mime type.
     *
     * @param mimeType - The mime type of interest.
     */
    removeMimeType(mimeType) {
        delete this._factories[mimeType];
        delete this._ranks[mimeType];
        this._types = null;
    }
    /**
     * Get the rank for a given mime type.
     *
     * @param mimeType - The mime type of interest.
     *
     * @returns The rank of the mime type or undefined.
     */
    getRank(mimeType) {
        let rank = this._ranks[mimeType];
        return rank && rank.rank;
    }
    /**
     * Set the rank of a given mime type.
     *
     * @param mimeType - The mime type of interest.
     *
     * @param rank - The new rank to assign.
     *
     * #### Notes
     * This is a no-op if the mime type is not registered.
     */
    setRank(mimeType, rank) {
        if (!this._ranks[mimeType]) {
            return;
        }
        let id = this._id++;
        this._ranks[mimeType] = { rank, id };
        this._types = null;
    }
}
exports.RenderMimeRegistry = RenderMimeRegistry;
/**
 * The namespace for `RenderMimeRegistry` class statics.
 */
(function (RenderMimeRegistry) {
    /**
     * A default resolver that uses a session and a contents manager.
     */
    class UrlResolver {
        /**
         * Create a new url resolver for a console.
         */
        constructor(options) {
            this._session = options.session;
            this._contents = options.contents;
        }
        /**
         * Resolve a relative url to an absolute url path.
         */
        resolveUrl(url) {
            if (this.isLocal(url)) {
                const cwd = encodeURI(coreutils_1.PathExt.dirname(this._session.path));
                url = coreutils_1.PathExt.resolve(cwd, url);
            }
            return Promise.resolve(url);
        }
        /**
         * Get the download url of a given absolute url path.
         */
        getDownloadUrl(url) {
            if (this.isLocal(url)) {
                // decode url->path before passing to contents api
                return this._contents.getDownloadUrl(decodeURI(url));
            }
            return Promise.resolve(url);
        }
        /**
         * Whether the URL should be handled by the resolver
         * or not.
         *
         * #### Notes
         * This is similar to the `isLocal` check in `URLExt`,
         * but it also checks whether the path points to any
         * of the `IDrive`s that may be registered with the contents
         * manager.
         */
        isLocal(url) {
            const path = decodeURI(url);
            return coreutils_1.URLExt.isLocal(url) || !!this._contents.driveName(path);
        }
    }
    RenderMimeRegistry.UrlResolver = UrlResolver;
})(RenderMimeRegistry = exports.RenderMimeRegistry || (exports.RenderMimeRegistry = {}));
/**
 * The namespace for the module implementation details.
 */
var Private;
(function (Private) {
    /**
     * Get the mime types in the map, ordered by rank.
     */
    function sortedTypes(map) {
        return Object.keys(map).sort((a, b) => {
            let p1 = map[a];
            let p2 = map[b];
            if (p1.rank !== p2.rank) {
                return p1.rank - p2.rank;
            }
            return p1.id - p2.id;
        });
    }
    Private.sortedTypes = sortedTypes;
})(Private || (Private = {}));
