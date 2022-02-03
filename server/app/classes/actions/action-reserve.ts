import ActionInfo from './action-info';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';

export default class ActionReserve extends ActionInfo {
    // eslint-disable-next-line no-unused-vars
    execute(game: Game, player: Player): GameUpdateData | void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
