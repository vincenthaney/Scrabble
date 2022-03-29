/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { describe } from 'mocha';
import { Container } from 'typedi';
import ObjectivesService from './objectives.service';

describe('ObjectiveService', () => {
    let service: ObjectivesService;

    beforeEach(() => {
        service = Container.get(ObjectivesService);
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    it('createObjectivesForGame should return new GameObjectives', () => {
        expect(service.createObjectivesForGame()).to.exist;
    });
});
