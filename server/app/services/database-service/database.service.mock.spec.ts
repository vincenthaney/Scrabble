import { MONGO_DATABASE_NAME } from '@app/constants/services-constants/mongo-db.const';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Service } from 'typedi';
import { TestTimer } from '../high-scores-service/high-scores.service.spec';

@Service()
export class DatabaseServiceMock {
    mongoServer: MongoMemoryServer;
    private db: Db;
    private mongoClient: MongoClient;

    // eslint-disable-next-line no-unused-vars
    async connectToServer(databaseUrl?: string): Promise<MongoClient | null> {
        try {
            const timer = new TestTimer('DATABASE SERVICE');

            this.mongoServer = await MongoMemoryServer.create();
            timer.check('create server');
            const mongoUri = this.mongoServer.getUri();
            timer.check('get uri');
            this.mongoClient = await MongoClient.connect(mongoUri);
            timer.check('connect');
            this.db = this.mongoClient.db(MONGO_DATABASE_NAME);
            timer.check('db');
        } catch (exception) {
            // Log the error but allow the server to not crash if it can't connect to the database
            // eslint-disable-next-line no-console
            console.error(exception);
        }
        return this.mongoClient;
    }

    async closeConnection(): Promise<void> {
        if (this.mongoClient) {
            return this.mongoClient.close();
        } else {
            return Promise.resolve();
        }
    }

    get database(): Db {
        return this.db;
    }
}
