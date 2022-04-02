/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from '@app/app';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { getDictionaryTestService } from '@app/services/dictionary-service/dictionary-test.service.spec';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { DictionaryController } from './dictionary.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_EXCEPTION = 'exception';

describe('DictionaryController', () => {
    let controller: DictionaryController;

    beforeEach(() => {
        Container.reset();
        Container.set(DictionaryService, getDictionaryTestService());
        controller = Container.get(DictionaryController);
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(controller).to.exist;
    });

    it('router should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(controller.router).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        describe('POST /dictionary', () => {
            it('should return CREATED', async () => {
                chai.spy.on(controller['dictionaryService'], 'addNewDictionary', () => {});

                return supertest(expressApp).post('/api/dictionaries').expect(StatusCodes.CREATED);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'addNewDictionary', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post('/api/dictionaries').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('PATCH /dictionary', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'updateDictionary', () => {});

                return supertest(expressApp).patch('/api/dictionaries').expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'updateDictionary', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).patch('/api/dictionaries').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('DELETE /dictionary', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'deleteDictionary', () => {});

                return supertest(expressApp).delete('/api/dictionaries').expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'deleteDictionary', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).delete('/api/dictionaries').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('GET /dictionaries', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'getDbDictionary', () => {
                    return {
                        title: 'dictionaryData.title',
                        description: 'dictionaryData.description',
                        words: 'dictionaryData.words',
                    };
                });

                return supertest(expressApp).get('/api/dictionaries').expect(StatusCodes.OK);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'getDbDictionary', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).get('/api/dictionaries').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('GET /dictionaries/summary', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'getAllDictionarySummaries', () => {});

                return supertest(expressApp).get('/api/dictionaries/summary').expect(StatusCodes.OK);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'getAllDictionarySummaries', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).get('/api/dictionaries/summary').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('DELETE /dictionaries/reset', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'resetDbDictionaries', () => {});

                return supertest(expressApp).delete('/api/dictionaries/reset').expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'resetDbDictionaries', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).delete('/api/dictionaries/reset').expect(StatusCodes.BAD_REQUEST);
            });
        });
    });
});
