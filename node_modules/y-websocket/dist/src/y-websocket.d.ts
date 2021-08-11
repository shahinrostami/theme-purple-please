/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { WebsocketProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
 *
 * @extends {Observable<string>}
 */
export class WebsocketProvider extends Observable<string> {
    /**
     * @param {string} serverUrl
     * @param {string} roomname
     * @param {Y.Doc} doc
     * @param {object} [opts]
     * @param {boolean} [opts.connect]
     * @param {awarenessProtocol.Awareness} [opts.awareness]
     * @param {Object<string,string>} [opts.params]
     * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
     * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
     */
    constructor(serverUrl: string, roomname: string, doc: Y.Doc, { connect, awareness, params, WebSocketPolyfill, resyncInterval }?: {
        connect?: boolean;
        awareness?: awarenessProtocol.Awareness;
        params?: {
            [x: string]: string;
        };
        WebSocketPolyfill?: typeof WebSocket;
        resyncInterval?: number;
    } | undefined);
    bcChannel: string;
    url: string;
    roomname: string;
    doc: Y.Doc;
    _WS: {
        new (url: string, protocols?: string | string[] | undefined): WebSocket;
        prototype: WebSocket;
        readonly CLOSED: number;
        readonly CLOSING: number;
        readonly CONNECTING: number;
        readonly OPEN: number;
    };
    awareness: awarenessProtocol.Awareness;
    wsconnected: boolean;
    wsconnecting: boolean;
    bcconnected: boolean;
    wsUnsuccessfulReconnects: number;
    messageHandlers: ((arg0: encoding.Encoder, arg1: decoding.Decoder, arg2: WebsocketProvider, arg3: boolean, arg4: number) => void)[];
    mux: mutex.mutex;
    /**
     * @type {boolean}
     */
    _synced: boolean;
    /**
     * @type {WebSocket?}
     */
    ws: WebSocket | null;
    wsLastMessageReceived: number;
    /**
     * Whether to connect to other peers or not
     * @type {boolean}
     */
    shouldConnect: boolean;
    /**
     * @type {number}
     */
    _resyncInterval: number;
    /**
     * @param {ArrayBuffer} data
     */
    _bcSubscriber: (data: ArrayBuffer) => void;
    /**
     * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
     * @param {Uint8Array} update
     * @param {any} origin
     */
    _updateHandler: (update: Uint8Array, origin: any) => void;
    /**
     * @param {any} changed
     * @param {any} origin
     */
    _awarenessUpdateHandler: ({ added, updated, removed }: any, origin: any) => void;
    _beforeUnloadHandler: () => void;
    _checkInterval: any;
    set synced(arg: boolean);
    /**
     * @type {boolean}
     */
    get synced(): boolean;
    connectBc(): void;
    disconnectBc(): void;
    disconnect(): void;
    connect(): void;
}
import { Observable } from "lib0/observable";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as mutex from "lib0/mutex";
