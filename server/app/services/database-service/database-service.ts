import { MONGO_DATABASE_NAME, MONGO_DB_URL } from '@app/constants/services-constants/mongo-db.const';
import { Db, MongoClient, Document, Collection } from 'mongodb';
import { Service } from 'typedi';

@Service()
export default class DatabaseService {
    private mongoClient: MongoClient;
    private db: Db;

    async populateDb(collectionName: string, data: Document[]): Promise<void> {
        const collection = await this.db.collection(collectionName);
        if (await this.isCollectionEmpty(collection)) {
            await collection.insertMany(data);
        }
    }

    async isCollectionEmpty(collection: Collection<Document>): Promise<boolean> {
        return (await collection.find({}).toArray()).length === 0;
    }

    async connectToServer(databaseUrl: string = MONGO_DB_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(databaseUrl);
            this.mongoClient = client;
            this.db = this.mongoClient.db(MONGO_DATABASE_NAME);
        } catch (exception) {
            // Log the error but allow the server to not crash if it can't connect to the database
            // eslint-disable-next-line no-console
            console.error('Unable to connect to the Mongo Database');
            return null;
        }
        // Log when the server is connected to the database
        // eslint-disable-next-line no-console
        console.log('Connected to the Mongo Database');

        return this.mongoClient;
    }
    async closeConnection(): Promise<void> {
        return this.mongoClient.close();
    }

    get database(): Db {
        return this.db;
    }
}
