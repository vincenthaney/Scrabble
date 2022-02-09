import ActionInfo from '@app/classes/actions/action-info';
import { LetterValue } from '@app/classes/tile';

export default class ActionReserve extends ActionInfo {
    getMessage(): string | undefined {
        const map = this.game.tileReserve.getTilesLeftPerLetter();
        const arr: [letter: LetterValue, amount: number][] = Array.from(map, ([v, k]) => [v, k]);
        const message = arr.map(([letter, amount]) => `${letter}: ${amount}`).join(', ');
        return message;
    }
    getOpponentMessage(): undefined {
        return undefined;
    }
}
