import ActionInfo from '@app/classes/actions/action-info';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LetterValue } from '@app/classes/tile';

export default class ActionReserve extends ActionInfo {
    execute(): GameUpdateData | void {
        const map = this.game.tileReserve.getTilesLeftPerLetter();
        const arr: [tiles: LetterValue, amount: number][] = Array.from(map, ([v, k]) => [v, k]);
        const message = arr.reduce((prev, [letter, amount]) => (prev += `${letter.toUpperCase()}: ${amount}, `), '');
        // eslint-disable-next-line no-console
        console.log(message);
    }

    getMessage(): string | undefined {
        return undefined;
    }
}
