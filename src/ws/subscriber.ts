import * as proto from './proto';
import { WsApi } from './ws';

export default function createSubscriber(ws: WsApi) {
    const subs: { [key: string]: (msg: any) => void } = {};

    ws.addMessageEventListener((m : proto.Message) => {
        if (m.type !== proto.MessageType.Publish) {
            return;
        }
        if (!m.subject) {
            return;
        }
        const handler = subs[m.subject];
        if (handler && m.payload) {
            handler(JSON.parse(m.payload));
        }
    });

    ws.addReconnectHandler(() => {
        for(const s in subs) {
            subscribe(s, subs[s]);
        }
    });

    function subscribe(subject: string, handler: (msg: any) => void) {
        subs[subject] = handler;
        ws.send({
            type: proto.MessageType.Subscribe,
            subjects: [subject],
        });
    }

    function unsubscribe(subject: string) {
        ws.send({
            type: proto.MessageType.Unsubscribe,
            subjects: [subject],
        });
        delete subs[subject];
    }

    function close() {
        for(const s in subs) {
            unsubscribe(s);
        }
    }

    return {
        subscribe,
        unsubscribe,
        close,
    }
}