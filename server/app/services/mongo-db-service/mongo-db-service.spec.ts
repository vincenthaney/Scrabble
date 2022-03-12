/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import MongoDbService from './mongo-db-service';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('MongoDbService', () => {
    let service: MongoDbService;
    beforeEach(() => {
        service = new MongoDbService();
    });

    it('should be created', () => {
        expect(service).to.exist;
    });
});
