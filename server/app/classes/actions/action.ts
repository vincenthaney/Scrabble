import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';

export default abstract class Action {
    abstract willEndTurn(): boolean;
    // messageColor: number; // TODO: potentially make a color enum

    abstract execute(game: Game, player: Player): GameUpdateData | void;

    abstract getMessage(): string;
}
