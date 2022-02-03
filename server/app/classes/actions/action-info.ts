import Action from './action';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';

export default abstract class ActionInfo implements Action {
    willEndTurn(): boolean {
        return false;
    }

    abstract execute(game: Game, player: Player): GameUpdateData | void;
    abstract getMessage(): string;
}
