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

                return supertest(expressApp).post('/api/dictionary').expect(StatusCodes.CREATED);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'addNewDictionary', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post('/api/dictionary').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('PATCH /dictionary', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'updateDictionary', () => {});

                return supertest(expressApp).patch('/api/dictionary').expect(StatusCodes.OK);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'updateDictionary', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).patch('/api/dictionary').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('DELETE /dictionary', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'deleteDictionary', () => {});

                return supertest(expressApp).delete('/api/dictionary').expect(StatusCodes.OK);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'deleteDictionary', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).delete('/api/dictionary').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('GET /dictionary', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'getDictionarySummaryTitles', () => {});

                return supertest(expressApp).get('/api/dictionary').expect(StatusCodes.OK);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'getDictionarySummaryTitles', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).get('/api/dictionary').expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('DELETE /dictionary/reset', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['dictionaryService'], 'resetDbDictionaries', () => {});

                return supertest(expressApp).delete('/api/dictionary/reset').expect(StatusCodes.OK);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller['dictionaryService'], 'resetDbDictionaries', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).delete('/api/dictionary/reset').expect(StatusCodes.BAD_REQUEST);
            });
        });
    });
});
