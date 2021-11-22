import * as proto from './proto';

export interface WsApi {
    send: (msg: proto.Message) => Promise<void>;
    addMessageEventListener: (handler: (m: proto.Message) => void) => void;
    addReconnectHandler: (handler: () => void) => void;
    close: () => void;
}

export default function connect(url: string): WsApi {
    let ws: WebSocket;
    let reconnectHandlers: (() => void)[] = [];
    let messageHandlers: ((e: MessageEvent) => void)[] = [];

    let openResolve: (val: any) => void;
    let openGuard: Promise<any>;

    function init() {
        ws = new WebSocket(url);
        ws.onopen = onWsOpen;
        ws.onclose = onWsClose;
        messageHandlers.forEach(h => {
            ws.addEventListener('message', h);
        });
        openGuard = new Promise(resolve => {
            openResolve = resolve;
            if (ws.readyState === ws.OPEN) {
                resolve(undefined);
            }
        });
    }

    let reconnectCnt = 0;
    let reconnectTimeout: number;

    function onWsOpen() {
        if (openResolve) {
            openResolve(undefined);
        }
        if (reconnectCnt > 0) {
            reconnectHandlers.forEach(h => h());
        }
        reconnectCnt = 0;
        clearTimeout(reconnectTimeout);
    }

    function onWsClose() {
        let timeoutDuration = 0;
        if (reconnectCnt > 0) {
            timeoutDuration = Math.pow(2, reconnectCnt - 1) * 1000;
        }
        reconnectTimeout = setTimeout(reconnect, timeoutDuration);
        reconnectCnt++;
    }

    function reconnect() {
        init();
        reconnectHandlers.forEach(h => h());
    }

    async function send(m: proto.Message) {
        await openGuard;
        const mp = proto.toProto(m);
        if (mp !== null) {
            ws.send(mp);
        }
    }

    function addMessageEventListener(handler: (m: proto.Message) => void) {
        const h = (e: MessageEvent) => {
            const m = proto.parse(e.data);
            if (m === null) {
                return;
            }
            handler(m);
        };
        ws.addEventListener('message', h);
        messageHandlers.push(h);
    }

    function addReconnectHandler(handler: () => void) {
        reconnectHandlers.push(handler);
    }

    function close() {
        messageHandlers = [];
        reconnectHandlers = [];
        ws.onclose = null;
        ws.close();
    }

    init();

    return {
        send,
        addMessageEventListener,
        addReconnectHandler,
        close,
    };
}
