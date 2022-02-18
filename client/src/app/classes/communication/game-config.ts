import { VirtualPlayerProfile } from '@app/classes/admin';
import { GameType } from '@app/classes/game-type';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { PlayerData } from './';
import { RoundData } from './round-data';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface SoloGameConfigData extends GameConfigData {
    virtualPlayerName: string;
    virtualPlayerLevel: VirtualPlayerProfile;
}

export interface GameConfig {
    player1: PlayerData;
    player2: PlayerData;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface StartGameData extends GameConfig {
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    tileReserveTotal: number;
    round: RoundData;
}
