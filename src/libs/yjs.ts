import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';

if (!window) throw new Error();

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
export const WEBSOCKET_HOST = `${protocol}://${window.location.host}`; // will connect to ws://host/<room>

export const ydoc = new Y.Doc();
export const mainPersistence = new IndexeddbPersistence('Quezy-main', ydoc);
mainPersistence.on('synced', () => {
    console.log('Main document data loaded from IndexedDB');
});


const wsProvider = new WebsocketProvider(WEBSOCKET_HOST, 'Quezy-main', ydoc);
export const awareness = wsProvider.awareness;