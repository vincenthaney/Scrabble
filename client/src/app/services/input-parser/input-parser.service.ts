import { Injectable } from '@angular/core';
import { ActionExchangePayload } from '@app/classes/actions/action-exchange';
import { ActionPlacePayload } from '@app/classes/actions/action-place';
import { Position } from '@app/classes/position';
import { InputControllerService } from '@app/input-controller.service';

@Injectable({
    providedIn: 'root',
})
export default class InputParserService {
    constructor(private controller: InputControllerService) {}

    parseInput(input: string): void {
        if (input[0] === '!') {
            const inputWords: string[] = input.substring(1).split(' ');
            const actionName: string = inputWords[0];
            console.log('action: ' + actionName);

            switch (actionName) {
                case 'placer':
                    // const placeActionPayload: ActionPlacePayload = this.createPlaceActionPayload(inputWords[1], inputWords[2]);
                    this.controller.sendPlaceAction(this.createPlaceActionPayload(inputWords[1], inputWords[2]));
                    break;
                case 'échanger':
                    // this.createExchangeActionPayload(inputWords[1]);
                    this.controller.sendExchangeAction(this.createExchangeActionPayload(inputWords[1]));
                    break;
                case 'passer':
                    this.controller.sendPassAction();
                    break;
                case 'réserve':
                    this.controller.sendReserveAction();
                    break;
                case 'indice':
                    this.controller.sendHintAction();
                    break;
                case 'aide':
                    this.controller.sendHelpAction();
                    break;
                default:
            }
        } else {
            console.log('ceci est un message');
        }
    }

    createPlaceActionPayload(location: string, lettersToPlace: string) {
        const inputStartPosition: Position = {
            row: location[0].toLowerCase().charCodeAt(0) - 97,
            column: +location.substring(1, location.length - 1) - 1,
        };
        console.log(inputStartPosition);

        const placeActionPayload: ActionPlacePayload = {
            letters: [...lettersToPlace],
            startPosition: inputStartPosition,
            orientation: location.charAt(location.length - 1),
        };
        console.log(placeActionPayload);
        return placeActionPayload;
    }

    createExchangeActionPayload(letters: string) {
        const exchangeActionPayload: ActionExchangePayload = {
            lettersToExchange: [...letters],
        };
        return exchangeActionPayload;
    }
}
