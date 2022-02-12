import ActionInfo from '@app/classes/actions/action-info';
import { LetterValue } from '@app/classes/tile';

export default class ActionReserve extends ActionInfo {
    getMessage(): string | undefined {
        const map = this.game.getTilesLeftPerLetter();
        const arr: [letter: LetterValue, amount: number][] = Array.from(map, ([v, k]) => [v, k]);
        const total = arr.reduce((prev, [, amount]) => (prev += amount), 0);
        let message = arr.map(([letter, amount]) => `${letter}: ${amount}`).join(', ');
        message += `\nTotal: ${total}`;
        return message;
    }
    getOpponentMessage(): undefined {
        return undefined;
    }
}
