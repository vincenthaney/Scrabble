import { AbstractWordFinding } from '@app/classes/word-finding';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createSandbox, SinonSandbox, SinonStub, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import DatabaseService from './database-service/database.service';
import { DatabaseServiceMock } from './database-service/database.service.mock.spec';
import { getDictionaryTestService } from './dictionary-service/dictionary-test.service.spec';
import DictionaryService from './dictionary-service/dictionary.service';
import WordFindingService from './word-finding-service/word-finding.service';

// eslint-disable-next-line @typescript-eslint/ban-types
type ClassType<T> = Function & { prototype: T };

type StubbedMember<T> = T extends (...args: infer TArgs) => infer TReturnValue ? SinonStub<TArgs, TReturnValue> : T;

type ClassOverride<TType> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof TType]?: StubbedMember<TType[K]> | (TType[K] extends (...args: any[]) => infer R ? R : TType[K]);
};

type ClassAttributesOverrides<T> = {
    [K in keyof T]?: T[K];
};

export class ServicesTestingUnit {
    private static server?: MongoMemoryServer;
    private sandbox: SinonSandbox;
    private stubbedInstances: Map<ClassType<unknown>, SinonStubbedInstance<unknown>>;

    constructor() {
        this.sandbox = createSandbox();
        this.stubbedInstances = new Map();

        Container.reset();
    }

    static async getMongoServer(): Promise<MongoMemoryServer> {
        if (!this.server) this.server = await MongoMemoryServer.create();
        return this.server;
    }

    withStubbed<T>(constructor: ClassType<T>, overrides?: ClassOverride<T>, attributesOverrides?: ClassAttributesOverrides<T>): ServicesTestingUnit {
        const instance = this.sandbox.createStubInstance(constructor, overrides);
        Container.set(constructor, instance);
        this.stubbedInstances.set(constructor, instance);

        if (attributesOverrides)
            for (const key of Object.keys(attributesOverrides)) {
                instance[key] = attributesOverrides[key];
            }

        return this;
    }

    withStubbedPrototypes<T>(
        constructor: ClassType<T>,
        overrides: ClassOverride<T>,
        stubAction: 'returns' | 'callsFake' = 'returns',
    ): ServicesTestingUnit {
        for (const key of Object.keys(overrides)) {
            this.sandbox.stub(constructor.prototype, key)[stubAction](overrides[key]);
        }
        return this;
    }

    withMockDatabaseService(): ServicesTestingUnit {
        Container.set(DatabaseService, new DatabaseServiceMock());
        return this;
    }

    withStubbedDictionaryService(): ServicesTestingUnit {
        const stubbedInstance: SinonStubbedInstance<DictionaryService> = getDictionaryTestService();
        Container.set(DictionaryService, stubbedInstance);
        this.stubbedInstances.set(DictionaryService, stubbedInstance);
        return this;
    }

    setStubbedWordFindingService(): [instance: SinonStubbedInstance<AbstractWordFinding>, service: SinonStubbedInstance<WordFindingService>] {
        const instance = this.sandbox.createStubInstance(AbstractWordFinding, {
            findWords: [],
        });
        const service = this.sandbox.createStubInstance(WordFindingService, {
            getWordFindingInstance: instance as unknown as AbstractWordFinding,
        });

        Container.set(WordFindingService, service);

        return [instance, service];
    }

    getStubbedInstance<T>(constructor: ClassType<T>): SinonStubbedInstance<T> {
        const instance: SinonStubbedInstance<T> | undefined = this.stubbedInstances.get(constructor) as SinonStubbedInstance<T>;

        if (instance) return instance;
        throw new Error(`No stubbed instance for ${constructor.name}`);
    }

    restore() {
        this.sandbox.restore();
    }
}
