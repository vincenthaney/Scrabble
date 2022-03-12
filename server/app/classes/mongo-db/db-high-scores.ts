export interface DbHighScore {
    gameType: string;
    score: number;
    names: string[];
}

export interface DbHighScores {
    highScores: DbHighScore[];
}
