import { IInstanceTracker, InstanceTracker } from '@jupyterlab/apputils';
import { MimeDocument } from '@jupyterlab/docregistry';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Token } from '@phosphor/coreutils';
import { JupyterLabPlugin } from './index';
/**
 * A class that tracks mime documents.
 */
export interface IMimeDocumentTracker extends IInstanceTracker<MimeDocument> {
}
/**
 * The mime document tracker token.
 */
export declare const IMimeDocumentTracker: Token<IMimeDocumentTracker>;
/**
 * Create rendermime plugins for rendermime extension modules.
 */
export declare function createRendermimePlugins(extensions: IRenderMime.IExtensionModule[]): JupyterLabPlugin<void | IMimeDocumentTracker>[];
/**
 * Create rendermime plugins for rendermime extension modules.
 */
export declare function createRendermimePlugin(tracker: InstanceTracker<MimeDocument>, item: IRenderMime.IExtension): JupyterLabPlugin<void>;
