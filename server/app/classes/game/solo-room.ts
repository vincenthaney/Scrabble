import Player from '@app/classes/player/player';
import { GameConfig, ReadyGameConfig } from './game-config';
import Room from './room';

export default class SoloRoom extends Room {
    joinedPlayer?: Player;
    private config: GameConfig;
    private readyConfig: ReadyGameConfig;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.joinedPlayer = undefined;
    }

    getReadyConfig(): ReadyGameConfig {
        return this.readyConfig;
    }

    setReadyConfig(virtualPlayer: Player): void {
        this.readyConfig = {
            ...this.config,
            player2: virtualPlayer,
        };
    }
}
