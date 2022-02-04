import { Injectable } from '@angular/core';
import { ActionExchangePayload } from '@app/classes/actions/action-exchange';
import { ActionPlacePayload } from '@app/classes/actions/action-place';

@Injectable({
    providedIn: 'root',
})
export class InputControllerService {
    sendPlaceAction(payload: ActionPlacePayload) {}
    sendExchangeAction(payload: ActionExchangePayload) {}
    sendPassAction() {}
    sendReserveAction() {}
    sendHintAction() {}
    sendHelpAction() {}

    sendMessage(message: string) {}
}
