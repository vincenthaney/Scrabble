export enum GameType {
    Classic = 'Classique',
    LOG2990 = 'LOG2990',
}

export type GameModeMultiplayer = 'multiplayer';
export type GameModeSolo = 'solo';
export type GameMode = GameModeMultiplayer | GameModeSolo;
