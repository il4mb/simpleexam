import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';

if(!window) throw new Error();

export const WEBSOCKET_HOST = `ws://${process.env.NEXT_PUBLIC_WEBSOCKET || window.location.hostname}:${process.env.NEXT_PUBLIC_PORT}`;

export const ydoc = new Y.Doc();
export const mainPersistence = new IndexeddbPersistence('Quezy-main', ydoc);
mainPersistence.on('synced', () => {
    console.log('Main document data loaded from IndexedDB');
});


const wsProvider = new WebsocketProvider(WEBSOCKET_HOST, 'Quezy-main', ydoc);
export const awareness = wsProvider.awareness;