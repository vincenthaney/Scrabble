import Player from '@app/classes/player/player';
import RoundManager from '@app/classes/round/round-manager';
import TileReserve from '@app/classes/tile/tile-reserve';
import { GameType } from './game.type';

export default class Game {
    player1: Player;
    player2: Player;
    roundManager: RoundManager;
    wordsPlayed: string[];
    gameType: GameType;
    tileReserve: TileReserve;
}
