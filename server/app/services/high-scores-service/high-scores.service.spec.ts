/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as mock from 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { HighScore, HighScoresData } from '@app/classes/database/high-score';
import { GameType } from '@app/classes/game/game-type';
import HighScoresService from './high-scores.service';
import Container from 'typedi';
import { DatabaseServiceMock } from '@app/services/database-service/database-service.mock.spec';
import DatabaseService from '@app/services/database-service/database-service';
import { stub } from 'sinon';
import { DEFAULT_HIGH_SCORES_RELATIVE_PATH } from '@app/constants/services-constants/mongo-db.const';
import { join } from 'path';
chai.use(chaiAsPromised); // this allows us to test for rejection

const HIGH_SCORE_CLASSIC_1: HighScore = {
    names: ['testname1', 'testname2'],
    score: 13,
    gameType: GameType.Classic,
};

const HIGH_SCORE_CLASSIC_2: HighScore = {
    names: ['weed', 'legal'],
    score: 420,
    gameType: GameType.Classic,
};

const HIGH_SCORE_CLASSIC_3: HighScore = {
    names: ['nice'],
    score: 69,
    gameType: GameType.Classic,
};

const HIGH_SCORE_LOG2990_1: HighScore = {
    names: ['nikolay'],
    score: 666,
    gameType: GameType.LOG2990,
};

const HIGH_SCORE_LOG2990_2: HighScore = {
    names: ['michel'],
    score: 60,
    gameType: GameType.LOG2990,
};

const INITIAL_HIGH_SCORES_CLASSIC: HighScore[] = [HIGH_SCORE_CLASSIC_1, HIGH_SCORE_CLASSIC_2, HIGH_SCORE_CLASSIC_3];
const SORTED_HIGH_SCORES_CLASSIC: HighScore[] = [HIGH_SCORE_CLASSIC_1, HIGH_SCORE_CLASSIC_3, HIGH_SCORE_CLASSIC_2];
const INITIAL_HIGH_SCORES_LOG2990: HighScore[] = [HIGH_SCORE_LOG2990_1, HIGH_SCORE_LOG2990_2];

const INITIAL_HIGH_SCORES: HighScore[] = INITIAL_HIGH_SCORES_CLASSIC.concat(INITIAL_HIGH_SCORES_LOG2990);

const mockInitialHighScores: HighScoresData = {
    highScores: INITIAL_HIGH_SCORES,
};

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, DEFAULT_HIGH_SCORES_RELATIVE_PATH)] = JSON.stringify(mockInitialHighScores);

describe('HighScoresService', () => {
    let highScoresService: HighScoresService;
    let databaseService: DatabaseService;
    let client: MongoClient;

    beforeEach(async () => {
        databaseService = Container.get(DatabaseServiceMock) as unknown as DatabaseService;
        client = (await databaseService.connectToServer()) as MongoClient;
        highScoresService = Container.get(HighScoresService);
        highScoresService['databaseService'] = databaseService;
        await highScoresService['collection'].insertMany(INITIAL_HIGH_SCORES);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
        chai.spy.restore();
    });

    describe('fetchDefaultHighScores', () => {
        it('should get all courses from JSON', async () => {
            mock(mockPaths);
            const highScores = await HighScoresService['fetchDefaultHighScores']();
            mock.restore();
            expect(highScores.length).to.equal(INITIAL_HIGH_SCORES.length);
        });
    });

    describe('getHighScores', () => {
        it('should get all courses from DB of given gameType', async () => {
            const highScores = await highScoresService.getHighScores(GameType.Classic);
            expect(highScores.length).to.equal(INITIAL_HIGH_SCORES_CLASSIC.length);
            expect(INITIAL_HIGH_SCORES_CLASSIC).to.deep.equals(highScores);
        });
    });

    describe('getAllHighScores', () => {
        it('should get all courses from DB', async () => {
            const highScores = await highScoresService.getAllHighScores();
            expect(highScores.length).to.equal(INITIAL_HIGH_SCORES.length);
            expect(INITIAL_HIGH_SCORES).to.deep.equals(highScores);
        });
    });

    describe('updateHighScore', () => {
        it('should update the highScore if the name is not already on it ', async () => {
            const newName = 'new name';
            expect(await highScoresService.updateHighScore(newName, HIGH_SCORE_CLASSIC_1)).to.be.true;
            const updatedHighScore = await highScoresService['collection'].findOne({
                score: HIGH_SCORE_CLASSIC_1.score,
                gameType: HIGH_SCORE_CLASSIC_1.gameType,
            });
            expect(updatedHighScore?.names.length).to.equal(HIGH_SCORE_CLASSIC_1.names.length + 1);
            expect(updatedHighScore?.names.includes(newName)).to.be.true;
        });
        it('should not update the highScore if the name is already on it ', async () => {
            const newName = HIGH_SCORE_CLASSIC_1.names[0];
            expect(await highScoresService.updateHighScore(newName, HIGH_SCORE_CLASSIC_1)).to.be.false;
            const updatedHighScore = await highScoresService['collection'].findOne({
                score: HIGH_SCORE_CLASSIC_1.score,
                gameType: HIGH_SCORE_CLASSIC_1.gameType,
            });
            expect(updatedHighScore).to.deep.equal(HIGH_SCORE_CLASSIC_1);
        });
    });

    describe('replaceHighScore', () => {
        it('should replace the highscore ', async () => {
            const newName = 'new name';
            const newScore = 1111;
            expect(await highScoresService.replaceHighScore(newName, newScore, HIGH_SCORE_CLASSIC_1)).to.be.true;
            expect(await highScoresService['collection'].findOne({ score: HIGH_SCORE_CLASSIC_1.score, gameType: HIGH_SCORE_CLASSIC_1.gameType })).to
                .not.be.ok;
            expect(await highScoresService['collection'].findOne({ score: newScore })).to.be.ok;
        });
    });

    describe('resetHighScores', () => {
        it('should call populateDb', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(highScoresService, 'populateDb', () => {});
            await highScoresService.resetHighScores();
            expect(spy).to.have.been.called;
        });

        it('should delete all documents of the array', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            chai.spy.on(highScoresService, 'populateDb', () => {});
            await highScoresService.resetHighScores();
            expect(await (await highScoresService['collection'].find({}).toArray()).length).to.equal(0);
        });
    });

    describe('populateDb', () => {
        it('should call databaseService.populateDb and fetchDefaultHighScores', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
            const spyFetchDefaultHighScores = stub(HighScoresService, <any>'fetchDefaultHighScores');
            // eslint-disable-next-line dot-notation, @typescript-eslint/no-empty-function
            const spyPopulateDb = chai.spy.on(highScoresService['databaseService'], 'populateDb', () => {});
            await highScoresService['populateDb']();
            expect(spyPopulateDb).to.have.been.called;
            assert(spyFetchDefaultHighScores.calledOnce);
        });
    });

    describe('getSortedHighScores', () => {
        it('should sort the highScores by ascending score order ', async () => {
            const spyGetHighScores = chai.spy.on(highScoresService, 'getHighScores', () => INITIAL_HIGH_SCORES_CLASSIC);

            expect(spyGetHighScores).to.have.been.called;
            expect(await highScoresService['getSortedHighScores'](GameType.Classic)).to.deep.equal(SORTED_HIGH_SCORES_CLASSIC);
        });
    });

    describe('addHighScore', () => {
        it('should call getSortedHighScores and return false if the new score is lower than the minimum score', async () => {
            const spyGetSortedHighScores = chai.spy.on(highScoresService, 'getSortedHighScores', () => SORTED_HIGH_SCORES_CLASSIC);
            const newName = 'new name';
            const newScore = 1;

            expect(await highScoresService.addHighScore(newName, newScore, GameType.Classic)).to.be.false;
            expect(spyGetSortedHighScores).to.have.been.called;
        });

        it('should call updateHighScore if the score is identical to one in the collection', async () => {
            const spyUpdateHighScore = chai.spy.on(highScoresService, 'updateHighScore', () => true);
            chai.spy.on(highScoresService, 'getSortedHighScores', () => SORTED_HIGH_SCORES_CLASSIC);
            const newName = 'new name';
            const newScore = HIGH_SCORE_CLASSIC_3.score;
            expect(await highScoresService.addHighScore(newName, newScore, GameType.Classic)).to.be.true;
            expect(spyUpdateHighScore).to.have.been.called;
        });

        it('should call replaceHighScore if the score higher and different to one in the collection', async () => {
            const spyUpdateHighScore = chai.spy.on(highScoresService, 'replaceHighScore', () => true);
            chai.spy.on(highScoresService, 'getSortedHighScores', () => SORTED_HIGH_SCORES_CLASSIC);
            const newName = 'new name';
            const newScore = HIGH_SCORE_CLASSIC_3.score + 1;
            expect(await highScoresService.addHighScore(newName, newScore, GameType.Classic)).to.be.true;
            expect(spyUpdateHighScore).to.have.been.called;
        });

        it('should not update the highScore if the name is already on it ', async () => {
            const newName = HIGH_SCORE_CLASSIC_1.names[0];
            expect(await highScoresService.updateHighScore(newName, HIGH_SCORE_CLASSIC_1)).to.be.false;
            const updatedHighScore = await highScoresService['collection'].findOne({
                score: HIGH_SCORE_CLASSIC_1.score,
                gameType: HIGH_SCORE_CLASSIC_1.gameType,
            });
            expect(updatedHighScore).to.deep.equal(HIGH_SCORE_CLASSIC_1);
        });
    });

    describe('Error handling', async () => {
        it('should throw an error if we try to access the database on a closed connection', async () => {
            await client.close();
            expect(highScoresService.getHighScores(GameType.Classic)).to.eventually.be.rejectedWith(Error);
        });
    });
});