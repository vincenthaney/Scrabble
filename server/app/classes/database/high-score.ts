export interface HighScore {
    gameType: string;
    score: number;
    names: string[];
}

export interface DbHighScoresData {
    highScores: HighScore[];
}
