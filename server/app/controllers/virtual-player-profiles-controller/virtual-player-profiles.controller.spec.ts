/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { VirtualPlayerProfile } from '@app/classes/database/virtual-player-profile';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import { afterEach } from 'mocha';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { VirtualPlayerProfilesController } from './virtual-player-profiles.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_EXCEPTION = 'exception';
const DEFAULT_PLAYER_ID = 'player-id';

const DEFAULT_PROFILE_1: VirtualPlayerProfile = {
    name: 'Brun',
    level: VirtualPlayerLevel.Beginner,
    isDefault: true,
};

const DEFAULT_PROFILE_2: VirtualPlayerProfile = {
    name: 'Vert',
    level: VirtualPlayerLevel.Expert,
    isDefault: true,
};

const CUSTOM_PROFILE_1: VirtualPlayerProfile = {
    name: 'Rouge',
    level: VirtualPlayerLevel.Beginner,
    isDefault: false,
};

const CUSTOM_PROFILE_2: VirtualPlayerProfile = {
    name: 'Turquoise',
    level: VirtualPlayerLevel.Expert,
    isDefault: false,
};

const DEFAULT_PROFILES: VirtualPlayerProfile[] = [DEFAULT_PROFILE_1, DEFAULT_PROFILE_2];
const CUSTOM_PROFILES: VirtualPlayerProfile[] = [CUSTOM_PROFILE_1, CUSTOM_PROFILE_2];
const ALL_PROFILES: VirtualPlayerProfile[] = DEFAULT_PROFILES.concat(CUSTOM_PROFILES);

describe.only('VirtualPlayerProfilesController', () => {
    let controller: VirtualPlayerProfilesController;

    beforeEach(() => {
        Container.reset();
        controller = Container.get(VirtualPlayerProfilesController);
    });

    afterEach(() => {
        sinon.restore();
        chai.spy.restore();
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

        describe('GET /virtualPlayerProfiles', () => {
            it('should return OK on valid request', async () => {
                const spy = chai.spy.on(controller['virtualPlayerProfileService'], 'getAllVirtualPlayerProfiles', () => ALL_PROFILES);

                return supertest(expressApp)
                    .get('/api/virtualPlayerProfiles')
                    .expect(StatusCodes.OK)
                    .then(() => expect(spy).to.have.been.called());
            });

            it('should return have gameHistories attribute in body', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'getAllVirtualPlayerProfiles', () => ALL_PROFILES);

                return expect((await supertest(expressApp).get('/api/virtualPlayerProfiles')).body).to.have.property('virtualPlayerProfiles');
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'getAllVirtualPlayerProfiles', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).get('/api/virtualPlayerProfiles').expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('GET /virtualPlayerProfiles/:level', () => {
            it('should return OK on valid request', async () => {
                const spy = chai.spy.on(controller['virtualPlayerProfileService'], 'getVirtualPlayerProfilesFromLevel', () => ALL_PROFILES);

                return supertest(expressApp)
                    .get(`/api/virtualPlayerProfiles/${VirtualPlayerLevel.Beginner}`)
                    .expect(StatusCodes.OK)
                    .then(() => expect(spy).to.have.been.called());
            });

            it('should return have gameHistories attribute in body', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'getVirtualPlayerProfilesFromLevel', () => ALL_PROFILES);

                return expect((await supertest(expressApp).get(`/api/virtualPlayerProfiles/${VirtualPlayerLevel.Expert}`)).body).to.have.property(
                    'virtualPlayerProfiles',
                );
            });

            it('should throw if level is invalid', async () => {
                return supertest(expressApp).get('/api/virtualPlayerProfiles/autre').expect(StatusCodes.BAD_REQUEST);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'getVirtualPlayerProfilesFromLevel', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .get(`/api/virtualPlayerProfiles/${VirtualPlayerLevel.Beginner}`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('POST /virtualPlayerProfiles', () => {
            it('should return OK on valid request', async () => {
                const spy = chai.spy.on(controller['virtualPlayerProfileService'], 'addVirtualPlayerProfile', () => {});

                return supertest(expressApp)
                    .post('/api/virtualPlayerProfiles')
                    .send({ virtualPlayerProfile: CUSTOM_PROFILE_1 })
                    .expect(StatusCodes.CREATED)
                    .then(() => expect(spy).to.have.been.called());
            });

            it('should throw if virtualPlayerProfile is not provided', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'addVirtualPlayerProfile', () => {});
                return supertest(expressApp)
                    .post('/api/virtualPlayerProfiles')
                    .send({ virtualPlayerProfile: undefined })
                    .expect(StatusCodes.BAD_REQUEST);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'addVirtualPlayerProfile', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .post('/api/virtualPlayerProfiles')
                    .send({ virtualPlayerProfile: CUSTOM_PROFILE_1 })
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('PATCH /virtualPlayerProfiles/:profileId', () => {
            it('should return NO_CONTENT on valid request', async () => {
                const spy = chai.spy.on(controller['virtualPlayerProfileService'], 'updateVirtualPlayerProfile', () => {});

                return supertest(expressApp)
                    .patch(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID}`)
                    .send({ newName: CUSTOM_PROFILE_1.name })
                    .expect(StatusCodes.NO_CONTENT)
                    .then(() => expect(spy).to.have.been.called());
            });

            it('should throw if newName is not provided', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'updateVirtualPlayerProfile', () => {});
                return supertest(expressApp)
                    .patch(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID}`)
                    .send({ newName: undefined })
                    .expect(StatusCodes.BAD_REQUEST);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'updateVirtualPlayerProfile', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .patch(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID}`)
                    .send({ newName: CUSTOM_PROFILE_1.name })
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('DELETE /virtualPlayerProfiles', () => {
            it('should return NO_CONTENT', async () => {
                const spy = chai.spy.on(controller['virtualPlayerProfileService'], 'resetVirtualPlayerProfiles', () => []);

                return supertest(expressApp)
                    .delete('/api/virtualPlayerProfiles')
                    .expect(StatusCodes.NO_CONTENT)
                    .then(() => expect(spy).to.have.been.called());
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'resetVirtualPlayerProfiles', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).delete('/api/virtualPlayerProfiles').expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('DELETE /virtualPlayerProfiles/:profileId', () => {
            it('should return NO_CONTENT', async () => {
                const spy = chai.spy.on(controller['virtualPlayerProfileService'], 'deleteVirtualPlayerProfile', () => []);

                return supertest(expressApp)
                    .delete(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID}`)
                    .expect(StatusCodes.NO_CONTENT)
                    .then(() => expect(spy).to.have.been.called());
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'deleteVirtualPlayerProfile', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).delete(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('DELETE /virtualPlayerProfiles', () => {
            it('should return NO_CONTENT', async () => {
                const spy = chai.spy.on(controller['virtualPlayerProfileService'], 'resetVirtualPlayerProfiles', () => []);

                return supertest(expressApp)
                    .delete('/api/virtualPlayerProfiles')
                    .expect(StatusCodes.NO_CONTENT)
                    .then(() => expect(spy).to.have.been.called());
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['virtualPlayerProfileService'], 'resetVirtualPlayerProfiles', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).delete('/api/virtualPlayerProfiles').expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });
});
