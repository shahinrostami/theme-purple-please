import { IEditorServices } from '@jupyterlab/codeeditor';
import '../style/index.css';
export * from './mode';
export * from './editor';
export * from './factory';
export * from './mimetype';
/**
 * The default editor services.
 */
export declare const editorServices: IEditorServices;
