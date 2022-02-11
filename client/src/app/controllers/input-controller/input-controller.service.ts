// will be removed in next MR, don't worry :)
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { ActionExchangePayload, ActionPlacePayload } from '@app/classes/actions/action-data';
import SocketService from '@app/services/socket/socket.service';

@Injectable({
    providedIn: 'root',
})
export class InputControllerService {
    constructor(private readonly socketService: SocketService) {}

    sendPlaceAction(payload: ActionPlacePayload) {
        this.socketService.connect();
    }

    sendExchangeAction(payload: ActionExchangePayload) {}
    sendPassAction() {}
    sendReserveAction() {}
    sendHintAction() {}
    sendHelpAction() {}

    sendMessage(message: string) {}
}
