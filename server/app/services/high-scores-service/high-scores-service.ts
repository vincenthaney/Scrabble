import { GameType } from '@app/classes/game/game.type';
import { promises } from 'fs';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { join } from 'path';
import { DbHighScore, DbHighScores } from '@app/classes/mongo-db/db-high-scores';
import { Collection, Document } from 'mongodb';
import { Service } from 'typedi';
import MongoDbService from '@app/services/mongo-db-service/mongo-db-service';
import { DEFAULT_HIGH_SCORES_RELATIVE_PATH } from '@app/constants/services-constants/mongo-db.const';

const HIGH_SCORES_MONGO_COLLECTION = 'HighScores';

@Service()
export default class HighScoresService {
    constructor(private mongoDbService: MongoDbService) {}

    get collection(): Collection<DbHighScore> {
        return this.mongoDbService.database.collection(HIGH_SCORES_MONGO_COLLECTION);
    }

    static async fetchDefaultHighScores(): Promise<DbHighScore[]> {
        const filePath = join(__dirname, DEFAULT_HIGH_SCORES_RELATIVE_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultHighScores = JSON.parse(dataBuffer);
        return defaultHighScores.highScores;
    }

    addHighScore(score: number, name: string, gameType: GameType): void {}

    getHighScores(gameType: GameType): DbHighScore[] {
        return [];
    }

    async resetHighScores(): Promise<void> {
        await this.collection.deleteMany({});
        this.populateDb();
    }

    async populateDb() {
        await this.mongoDbService.populateDb(HIGH_SCORES_MONGO_COLLECTION, await HighScoresService.fetchDefaultHighScores());
    }
}
