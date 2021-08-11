/**
 * @packageDocumentation
 * @module codemirror
 */
import { IEditorServices } from '@jupyterlab/codeeditor';
export * from './editor';
export * from './factory';
export * from './mimetype';
export * from './mode';
export * from './syntaxstatus';
export * from './tokens';
/**
 * The default editor services.
 */
export declare const editorServices: IEditorServices;
/**
 * FIXME-TRANS: Maybe an option to be able to pass a translator to the factories?
 *

export function getEditorServices(translator: ITranslator): IEditorServices {
  return {
    factoryService: new CodeMirrorEditorFactory({}, translator),
    mimeTypeService: new CodeMirrorMimeTypeService(translator)
  };
}
 */
