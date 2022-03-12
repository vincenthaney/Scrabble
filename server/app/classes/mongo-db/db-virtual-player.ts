export interface DbVirtualPlayer {
    level: string;
    name: string;
    isDefault: boolean;
}

export interface DbVirtualPlayerData {
    players: DbVirtualPlayer[];
}
