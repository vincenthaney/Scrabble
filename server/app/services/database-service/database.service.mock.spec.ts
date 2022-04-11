import { MONGO_DATABASE_NAME } from '@app/constants/services-constants/mongo-db.const';
import { EventEmitter } from 'events';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Service } from 'typedi';
import { ServicesTestingUnit } from '@app/services/services-testing-unit';

@Service()
export class DatabaseServiceMock {
    mongoServer: MongoMemoryServer;
    private db: Db;
    private mongoClient: MongoClient;
    private databaseInitialized$: EventEmitter;

    constructor() {
        this.databaseInitialized$ = new EventEmitter();
    }
    // eslint-disable-next-line no-unused-vars
    async connectToServer(databaseUrl?: string): Promise<MongoClient | null> {
        try {
            this.mongoServer = await ServicesTestingUnit.getMongoServer();
            const mongoUri = this.mongoServer.getUri();
            this.mongoClient = await MongoClient.connect(mongoUri);
            this.db = this.mongoClient.db(MONGO_DATABASE_NAME);
            this.databaseInitialized$.emit('initialize');
        } catch (exception) {
            // Log the error but allow the server to not crash if it can't connect to the database
            // eslint-disable-next-line no-console
            console.error(exception);
        }
        return this.mongoClient;
    }

    async closeConnection(): Promise<void> {
        if (this.mongoClient) {
            await this.db.dropDatabase();
            return this.mongoClient.close();
        } else {
            return Promise.resolve();
        }
    }

    get database(): Db {
        return this.db;
    }

    getDatabaseInitializationEvent(): EventEmitter {
        return this.databaseInitialized$;
    }
}
