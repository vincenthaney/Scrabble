import Player from '@app/classes/player/player';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { GameConfig } from './game-config';
import Room from './room';

export default class WaitingRoom extends Room {
    joinedPlayer?: Player;
    private config: GameConfig;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.joinedPlayer = undefined;
    }

    getConfig(): GameConfig {
        return this.config;
    }

    convertToLobbyData(): LobbyData {
        return {
            dictionary: this.getConfig().dictionary,
            hostName: this.getConfig().player1.name,
            maxRoundTime: this.getConfig().maxRoundTime,
            lobbyId: this.getId(),
            gameType: this.getConfig().gameType,
        };
    }
}
