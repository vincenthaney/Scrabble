import { GameType } from '@app/classes/game-type';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface SoloGameConfigData extends GameConfigData {
    virtualPlayerName: string;
}

export interface GameConfig {
    player1: Player;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface MultiplayerGameConfig extends GameConfig {
    player2: Player;
}

export interface StartMultiplayerGameData extends MultiplayerGameConfig {
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    round: Round;
}
