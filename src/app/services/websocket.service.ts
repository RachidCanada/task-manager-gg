import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket"

@Injectable({
    providedIn: "root"
})
export class WebSocketService {
    private socket$: WebSocketSubject<any>;

    constructor(){
        this.socket$ = webSocket('ws://localhost:8081');  // Assurez-vous que l'URL est correcte
    }

    sendMessage(msg: any){
        this.socket$.next(msg);
    }

    getMessage(): Observable<any> {
        return this.socket$.asObservable();
    }
}