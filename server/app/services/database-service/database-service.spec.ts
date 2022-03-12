/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { HIGH_SCORES_MONGO_COLLECTION, MONGO_DATABASE } from '@app/constants/services-constants/mongo-db.const';
import { fail } from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient, Document } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Container } from 'typedi';
import DatabaseService from './database-service';
chai.use(chaiAsPromised);

describe.only('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = Container.get(DatabaseService);

        mongoServer = await MongoMemoryServer.create();
    });

    afterEach(async () => {
        if (databaseService['mongoClient']) {
            await databaseService['mongoClient'].close();
        }
    });

    // Remark : We dont test the case when MONGO_URL is used in order to not connect to the real database
    it('should connect to the database when start is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.connectToServer(mongoUri);
        expect(databaseService['mongoClient']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal(MONGO_DATABASE);
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        databaseService['mongoClient'] = undefined as unknown as MongoClient;
        try {
            await databaseService.connectToServer('WRONG URL');
            fail();
        } catch {
            expect(databaseService['mongoClient']).to.be.undefined;
        }
        const mongoUri = await mongoServer.getUri();
        await databaseService.connectToServer(mongoUri);
    });

    it('should populate the database with a helper function', async () => {
        const mongoUri = await mongoServer.getUri();
        const client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(MONGO_DATABASE);
        const testHighScores: Document[] = [{ score: 1 }, { score: 1 }, { score: 1 }, { score: 1 }];
        await databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION, testHighScores);
        const highScores = await databaseService.database.collection(HIGH_SCORES_MONGO_COLLECTION).find({}).toArray();
        expect(highScores.length).to.equal(testHighScores.length);
    });

    it('should not populate the database with start function if it is already populated', async () => {
        const initialHighScores: Document[] = [{ score: 1 }, { score: 1 }, { score: 1 }, { score: 1 }];
        const testHighScores: Document[] = [{ score: 1 }, { score: 1 }];

        const mongoUri = await mongoServer.getUri();

        let client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(MONGO_DATABASE);
        await databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION, initialHighScores);

        await databaseService.closeConnection();

        client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(MONGO_DATABASE);
        await databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION, testHighScores);

        const highScores = await databaseService.database.collection(HIGH_SCORES_MONGO_COLLECTION).find({}).toArray();
        expect(highScores.length).to.equal(initialHighScores.length);
    });
});
