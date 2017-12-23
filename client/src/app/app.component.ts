import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    public serverMessages = new Array<string>();

    public clientMessage: string;

    private socket$: WebSocketSubject<{msg: string}>;

    constructor() {
        this.socket$ = WebSocketSubject.create('ws://localhost:8999');

        this.socket$.subscribe(
            (message) => this.serverMessages.push(message.msg),
            (err) => console.error(err),
            () => console.warn('Completed!')
        );
    }

    public send(msg: string) {
        this.socket$.next(<any>JSON.stringify({ msg: msg }));
    }
}
