import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { promises } from 'fs';
import { join } from 'path';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { DEFAULT_HIGH_SCORES_RELATIVE_PATH, HIGH_SCORES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db.const';
import { HighScoresData, HighScore } from '@app/classes/database/high-score';
import { GameType } from '@app/classes/game/game-type';

@Service()
export default class HighScoresService {
    constructor(private databaseService: DatabaseService) {}

    private static async fetchDefaultHighScores(): Promise<HighScore[]> {
        const filePath = join(__dirname, DEFAULT_HIGH_SCORES_RELATIVE_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultHighScores: HighScoresData = JSON.parse(dataBuffer);
        return defaultHighScores.highScores;
    }

    async getAllHighScores(): Promise<HighScore[]> {
        return this.collection.find({}).toArray();
    }

    async addHighScore(name: string, score: number, gameType: GameType): Promise<boolean> {
        const sortedHighScores = await this.getSortedHighScores(gameType);

        const lowestHighScore = sortedHighScores[0];
        if (lowestHighScore.score > score) return false;

        const presentHighScore = sortedHighScores.find((highScore) => highScore.score === score);
        if (presentHighScore) return this.updateHighScore(name, presentHighScore);

        return this.replaceHighScore(name, score, sortedHighScores[0]);
    }

    async resetHighScores(): Promise<void> {
        await this.collection.deleteMany({});
        await this.populateDb();
    }

    private async updateHighScore(name: string, highScore: HighScore): Promise<boolean> {
        if (highScore.names.find((currentName) => currentName === name)) return false;
        await this.collection.updateOne({ score: highScore.score, gameType: highScore.gameType }, { $push: { names: name } });
        return true;
    }

    private async replaceHighScore(name: string, score: number, highScore: HighScore): Promise<boolean> {
        await this.collection.replaceOne(
            { score: highScore.score, gameType: highScore.gameType },
            { gameType: highScore.gameType, score, names: [name] },
        );
        return true;
    }

    private get collection(): Collection<HighScore> {
        return this.databaseService.database.collection(HIGH_SCORES_MONGO_COLLECTION_NAME);
    }

    private async getHighScores(gameType: GameType): Promise<HighScore[]> {
        return this.collection.find({ gameType }).toArray();
    }

    private async getSortedHighScores(gameType: GameType): Promise<HighScore[]> {
        return (await this.getHighScores(gameType)).sort((previous, current) => previous.score - current.score);
    }

    private async populateDb(): Promise<void> {
        await this.databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION_NAME, await HighScoresService.fetchDefaultHighScores());
    }
}
