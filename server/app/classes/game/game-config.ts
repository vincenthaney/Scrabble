import { RoundData } from '@app/classes/communication/round-data';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { GameType } from './game.type';

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
    tileReserveTotal: number;
    round: RoundData;
}
