export interface HighScore {
    gameType: string;
    score: number;
    names: string[];
}

export interface HighScoresData {
    highScores: HighScore[];
}
