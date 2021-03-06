import createRequester from "./requester";
import createSubscriber from "./subscriber";
import connect from "./ws";

export interface WsApi {
    request: (uri: string, data: any) => Promise<any>;
    subscribe: (subject: string, handler: (msg: any) => void) => void;
    close: () => void;
}

export default function createApi(url?: string): WsApi {
    if (!url && mantilEnv) {
        url = mantilEnv.endpoints.ws;
    }
    if (!url) {
        throw('No WebSocket URL provided.')
    }
    const ws = connect(url);
    const requester = createRequester(ws);
    const subscriber = createSubscriber(ws);

    function close() {
        requester.close();
        subscriber.close();
        ws.close();
    }

    return {
        request: requester.request,
        subscribe: subscriber.subscribe,
        close,
    }
}
