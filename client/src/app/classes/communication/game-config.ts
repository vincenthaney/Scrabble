import { GameType } from '@app/classes/game-type';
import Player from '@app/classes/player/player';

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
    dictionaryName: string;
}

export interface MultiplayerGameConfig extends GameConfig {
    player2: Player;
}
