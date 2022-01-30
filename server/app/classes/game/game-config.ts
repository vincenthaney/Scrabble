import Player from '@app/classes/player/player';
import { GameType } from './game.type';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
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

export interface SoloGameConfig extends GameConfig {
    virtualPlayerName: string;
}
