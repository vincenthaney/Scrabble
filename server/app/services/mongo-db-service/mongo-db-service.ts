import { MONGO_DATABASE, MONGO_URL } from '@app/constants/services-constants/mongo-db.const';
import { Collection, Db, FindOptions, MongoClient, Document, ModifyResult } from 'mongodb';
import { Service } from 'typedi';

@Service()
export default class MongoDbService {
    mongoClient: MongoClient;
    private db: Db;

    // async getCollection(collectionName: string): Promise<Collection> {
    //     return this.database.collection(collectionName);
    // }

    // async findOne(collectionName: string, query: FindOptions): Promise<Document | undefined> {
    //     return this.database.collection(collectionName).findOne(query);
    // }

    // async findAll(collectionName: string): Promise<Document[]> {
    //     return await this.database.collection(collectionName).find({}).toArray();
    // }

    // async findOneAndReplace(collectionName: string, query: FindOptions, newValue: Document): Promise<ModifyResult<Document>> {
    //     return this.database.collection(collectionName).findOneAndReplace(query, newValue);
    // }

    // async findOneAndDelete(collectionName: string, query: FindOptions): Promise<ModifyResult<Document>> {
    //     return this.database.collection(collectionName).findOneAndDelete(query);
    // }

    // async findOneAndDelete(collectionName: string, query: FindOptions): Promise<ModifyResult<Document>> {
    //     return this.database.collection(collectionName).findOneAndDelete(query);
    // }

    async populateDb(collectionName: string, data: Document[]): Promise<void> {
        const collection = await this.db.collection(collectionName);
        if ((await collection.find({}).toArray()).length === 0) {
            await collection.insertMany(data);
        }
    }

    async connectToServer(databaseUrl: string = MONGO_URL): Promise<void> {
        try {
            this.mongoClient = new MongoClient(databaseUrl);
            await this.mongoClient.connect();
            this.db = this.mongoClient.db(MONGO_DATABASE);
        } catch (exception) {
            // Log the error but allow the server to not crash if it cant connect to the database
            // eslint-disable-next-line no-console
            console.error(exception);
        }
    }
    async closeConnection(): Promise<void> {
        return this.mongoClient.close();
    }

    get database(): Db {
        return this.db;
    }
}
