import { Token } from '@lumino/coreutils';
import CodeMirror from 'codemirror';
/**
 * The CodeMirror token.
 */
export declare const ICodeMirror: Token<ICodeMirror>;
/** The CodeMirror interface. */
export interface ICodeMirror {
    /**
     * A singleton CodeMirror module, rexported.
     */
    CodeMirror: typeof CodeMirror;
    /**
     * A function to allow extensions to ensure that
     * the vim keymap has been imported
     */
    ensureVimKeymap: () => Promise<void>;
}
