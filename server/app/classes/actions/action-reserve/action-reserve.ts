import ActionInfo from '@app/classes/actions/action-info';
import { LetterValue } from '@app/classes/tile';

export default class ActionReserve extends ActionInfo {
    getMessage(): string | undefined {
        const map = this.game.tileReserve.getTilesLeftPerLetter();
        const arr: [tiles: LetterValue, amount: number][] = Array.from(map, ([v, k]) => [v, k]);
        const message = arr.reduce((prev, [letter, amount]) => (prev += `${letter.toUpperCase()}: ${amount}, `), '');
        return message;
    }
    getOpponentMessage(): undefined {
        return undefined;
    }
}
