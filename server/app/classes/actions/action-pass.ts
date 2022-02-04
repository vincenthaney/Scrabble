import ActionPlay from './action-play';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';

export default class ActionPass extends ActionPlay {
    /* eslint-disable @typescript-eslint/no-empty-function */
    // eslint-disable-next-line no-unused-vars
    execute(game: Game, player: Player): GameUpdateData | void {}

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
