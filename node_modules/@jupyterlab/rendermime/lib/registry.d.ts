import { Contents, Session } from '@jupyterlab/services';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { IClientSession, ISanitizer } from '@jupyterlab/apputils';
import { ReadonlyJSONObject, Token } from '@phosphor/coreutils';
import { MimeModel } from './mimemodel';
/**
 * The rendermime token.
 */
export declare const IRenderMimeRegistry: Token<IRenderMimeRegistry>;
export interface IRenderMimeRegistry extends RenderMimeRegistry {
}
/**
 * The latex typesetter token.
 */
export declare const ILatexTypesetter: Token<IRenderMime.ILatexTypesetter>;
export interface ILatexTypesetter extends IRenderMime.ILatexTypesetter {
}
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
export declare class RenderMimeRegistry {
    /**
     * Construct a new rendermime.
     *
     * @param options - The options for initializing the instance.
     */
    constructor(options?: RenderMimeRegistry.IOptions);
    /**
     * The sanitizer used by the rendermime instance.
     */
    readonly sanitizer: ISanitizer;
    /**
     * The object used to resolve relative urls for the rendermime instance.
     */
    readonly resolver: IRenderMime.IResolver | null;
    /**
     * The object used to handle path opening links.
     */
    readonly linkHandler: IRenderMime.ILinkHandler | null;
    /**
     * The LaTeX typesetter for the rendermime.
     */
    readonly latexTypesetter: IRenderMime.ILatexTypesetter | null;
    /**
     * The ordered list of mimeTypes.
     */
    readonly mimeTypes: ReadonlyArray<string>;
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
    preferredMimeType(bundle: ReadonlyJSONObject, safe?: 'ensure' | 'prefer' | 'any'): string | undefined;
    /**
     * Create a renderer for a mime type.
     *
     * @param mimeType - The mime type of interest.
     *
     * @returns A new renderer for the given mime type.
     *
     * @throws An error if no factory exists for the mime type.
     */
    createRenderer(mimeType: string): IRenderMime.IRenderer;
    /**
     * Create a new mime model.  This is a convenience method.
     *
     * @options - The options used to create the model.
     *
     * @returns A new mime model.
     */
    createModel(options?: MimeModel.IOptions): MimeModel;
    /**
     * Create a clone of this rendermime instance.
     *
     * @param options - The options for configuring the clone.
     *
     * @returns A new independent clone of the rendermime.
     */
    clone(options?: RenderMimeRegistry.ICloneOptions): RenderMimeRegistry;
    /**
     * Get the renderer factory registered for a mime type.
     *
     * @param mimeType - The mime type of interest.
     *
     * @returns The factory for the mime type, or `undefined`.
     */
    getFactory(mimeType: string): IRenderMime.IRendererFactory | undefined;
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
    addFactory(factory: IRenderMime.IRendererFactory, rank?: number): void;
    /**
     * Remove a mime type.
     *
     * @param mimeType - The mime type of interest.
     */
    removeMimeType(mimeType: string): void;
    /**
     * Get the rank for a given mime type.
     *
     * @param mimeType - The mime type of interest.
     *
     * @returns The rank of the mime type or undefined.
     */
    getRank(mimeType: string): number | undefined;
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
    setRank(mimeType: string, rank: number): void;
    private _id;
    private _ranks;
    private _types;
    private _factories;
}
/**
 * The namespace for `RenderMimeRegistry` class statics.
 */
export declare namespace RenderMimeRegistry {
    /**
     * The options used to initialize a rendermime instance.
     */
    interface IOptions {
        /**
         * Initial factories to add to the rendermime instance.
         */
        initialFactories?: ReadonlyArray<IRenderMime.IRendererFactory>;
        /**
         * The sanitizer used to sanitize untrusted html inputs.
         *
         * If not given, a default sanitizer will be used.
         */
        sanitizer?: IRenderMime.ISanitizer;
        /**
         * The initial resolver object.
         *
         * The default is `null`.
         */
        resolver?: IRenderMime.IResolver;
        /**
         * An optional path handler.
         */
        linkHandler?: IRenderMime.ILinkHandler;
        /**
         * An optional LaTeX typesetter.
         */
        latexTypesetter?: IRenderMime.ILatexTypesetter;
    }
    /**
     * The options used to clone a rendermime instance.
     */
    interface ICloneOptions {
        /**
         * The new sanitizer used to sanitize untrusted html inputs.
         */
        sanitizer?: IRenderMime.ISanitizer;
        /**
         * The new resolver object.
         */
        resolver?: IRenderMime.IResolver;
        /**
         * The new path handler.
         */
        linkHandler?: IRenderMime.ILinkHandler;
        /**
         * The new LaTeX typesetter.
         */
        latexTypesetter?: IRenderMime.ILatexTypesetter;
    }
    /**
     * A default resolver that uses a session and a contents manager.
     */
    class UrlResolver implements IRenderMime.IResolver {
        /**
         * Create a new url resolver for a console.
         */
        constructor(options: IUrlResolverOptions);
        /**
         * Resolve a relative url to an absolute url path.
         */
        resolveUrl(url: string): Promise<string>;
        /**
         * Get the download url of a given absolute url path.
         */
        getDownloadUrl(url: string): Promise<string>;
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
        isLocal(url: string): boolean;
        private _session;
        private _contents;
    }
    /**
     * The options used to create a UrlResolver.
     */
    interface IUrlResolverOptions {
        /**
         * The session used by the resolver.
         */
        session: Session.ISession | IClientSession;
        /**
         * The contents manager used by the resolver.
         */
        contents: Contents.IManager;
    }
}
