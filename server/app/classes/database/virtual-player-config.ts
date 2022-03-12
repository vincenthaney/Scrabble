export interface VirtualPlayerConfig {
    level: string;
    name: string;
    isDefault: boolean;
}

export interface VirtualPlayersConfigData {
    virtualPlayers: VirtualPlayerConfig[];
}
