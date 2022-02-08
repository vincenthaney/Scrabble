// will be removed in next MR, don't worry :)
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { ActionExchangePayload } from '@app/classes/actions/action-exchange';
import { ActionPlacePayload } from '@app/classes/actions/action-place';

@Injectable({
    providedIn: 'root',
})
export class InputControllerService {
    constructor(private readonly socketService: SocketService) {}

    sendPlaceAction(payload: ActionPlacePayload) {}

    sendExchangeAction(payload: ActionExchangePayload) {}
    sendPassAction() {}
    sendReserveAction() {}
    sendHintAction() {}
    sendHelpAction() {}

    sendMessage(message: string) {}
}
