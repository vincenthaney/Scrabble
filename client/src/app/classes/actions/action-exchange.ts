import { ActionPlay } from '@app/classes/actions';

export interface ActionExchangePayload {
    lettersToExchange: string[];
}

export default class ActionExchange extends ActionPlay {
    lettersToExchange: string[];

    constructor(lettersToExchange: string[]) {
        super();
        this.lettersToExchange = lettersToExchange;
        throw new Error('Method not implemented.');
    }

    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
