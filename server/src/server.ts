import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

function createMessage(message: string): string {
    return JSON.stringify({ msg: message });
}

wss.on('connection', (ws: WebSocket) => {

    const extWs = ws as ExtWebSocket;

    extWs.isAlive = true;

    ws.on('pong', () => {
        extWs.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    ws.on('message', (msgString: string) => {

        const message = JSON.parse(msgString);
        //log the received message and send it back to the client
        console.log(message);

        const broadcastRegex = /^broadcast\:/;

        if (broadcastRegex.test(message.msg)) {
            message.msg = message.msg.replace(broadcastRegex, '');

            //send back the message to the other clients
            wss.clients
                .forEach(client => {
                    if (client != ws) {
                        client.send(createMessage(`Hello, broadcast message -> ${message.msg}`));
                    }
                });

        } else {
            ws.send(createMessage(`Hello, you sent -> ${message.msg}`));
        }
    });

    //send immediatly a feedback to the incoming connection    
    ws.send(createMessage('Hi there, I am a WebSocket server'));
});

setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {

        const extWs = ws as ExtWebSocket;

        if (!extWs.isAlive) return ws.terminate();

        extWs.isAlive = false;
        ws.ping(null, undefined, true);
    });
}, 10000);

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});