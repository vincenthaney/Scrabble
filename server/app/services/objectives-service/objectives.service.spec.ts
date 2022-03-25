/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { Container } from 'typedi';
import ObjectivesService from './objectives.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('ObjectiveService', () => {
    let service: ObjectivesService;

    beforeEach(() => {
        service = Container.get(ObjectivesService);
    });

    it('should create', () => {
        expect(service).to.exist;
    });
});
