import { IRenderMime, RenderMimeRegistry } from '@jupyterlab/rendermime';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import { ABCWidgetFactory, DocumentWidget } from './default';
import { DocumentRegistry } from './registry';
/**
 * A content widget for a rendered mimetype document.
 */
export declare class MimeContent extends Widget {
    /**
     * Construct a new widget.
     */
    constructor(options: MimeContent.IOptions);
    /**
     * The mimetype for this rendered content.
     */
    readonly mimeType: string;
    /**
     * A promise that resolves when the widget is ready.
     */
    readonly ready: Promise<void>;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    /**
     * Handle an `update-request` message to the widget.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Render the mime content.
     */
    private _render;
    /**
     * A bound change callback.
     */
    private _changeCallback;
    readonly renderer: IRenderMime.IRenderer;
    private _context;
    private _monitor;
    private _ready;
    private _dataType;
    private _isRendering;
    private _renderRequested;
}
/**
 * The namespace for MimeDocument class statics.
 */
export declare namespace MimeContent {
    /**
     * The options used to initialize a MimeDocument.
     */
    interface IOptions {
        /**
         * Context
         */
        context: DocumentRegistry.IContext<DocumentRegistry.IModel>;
        /**
         * The renderer instance.
         */
        renderer: IRenderMime.IRenderer;
        /**
         * The mime type.
         */
        mimeType: string;
        /**
         * The render timeout.
         */
        renderTimeout: number;
        /**
         * Preferred data type from the model.
         */
        dataType?: 'string' | 'json';
    }
}
/**
 * A document widget for mime content.
 */
export declare class MimeDocument extends DocumentWidget<MimeContent> {
}
/**
 * An implementation of a widget factory for a rendered mimetype document.
 */
export declare class MimeDocumentFactory extends ABCWidgetFactory<MimeDocument> {
    /**
     * Construct a new mimetype widget factory.
     */
    constructor(options: MimeDocumentFactory.IOptions<MimeDocument>);
    /**
     * Create a new widget given a context.
     */
    protected createNewWidget(context: DocumentRegistry.Context): MimeDocument;
    private _rendermime;
    private _renderTimeout;
    private _dataType;
    private _fileType;
}
/**
 * The namespace for MimeDocumentFactory class statics.
 */
export declare namespace MimeDocumentFactory {
    /**
     * The options used to initialize a MimeDocumentFactory.
     */
    interface IOptions<T extends MimeDocument> extends DocumentRegistry.IWidgetFactoryOptions<T> {
        /**
         * The primary file type associated with the document.
         */
        primaryFileType: DocumentRegistry.IFileType;
        /**
         * The rendermime instance.
         */
        rendermime: RenderMimeRegistry;
        /**
         * The render timeout.
         */
        renderTimeout?: number;
        /**
         * Preferred data type from the model.
         */
        dataType?: 'string' | 'json';
    }
}
