import { MONGO_DATABASE_NAME, MONGO_DB_URL } from '@app/constants/services-constants/mongo-db.const';
import { EventEmitter } from 'events';
import { Collection, Db, Document, MongoClient } from 'mongodb';
import { Service } from 'typedi';

@Service()
export default class DatabaseService {
    private mongoClient: MongoClient;
    private db: Db;
    private databaseInitialized$: EventEmitter;

    constructor() {
        this.databaseInitialized$ = new EventEmitter();
    }

    async populateDb(collectionName: string, data: Document[]): Promise<void> {
        const collection = this.db.collection(collectionName);
        if (await this.isCollectionEmpty(collection)) {
            await collection.insertMany(data);
        }
    }

    async connectToServer(databaseUrl: string = MONGO_DB_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(databaseUrl);
            this.mongoClient = client;
            this.db = this.mongoClient.db(MONGO_DATABASE_NAME);
        } catch (exception) {
            return null;
        }
        this.databaseInitialized$.emit('initialize');
        return this.mongoClient;
    }

    async closeConnection(): Promise<void> {
        return this.mongoClient.close();
    }

    get database(): Db {
        return this.db;
    }

    async isCollectionEmpty(collection: Collection<Document>): Promise<boolean> {
        return (await collection.countDocuments({})) === 0;
    }

    getDatabaseInitializationEvent(): EventEmitter {
        return this.databaseInitialized$;
    }
}
