/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Game from '@app/classes/game/game';
import { GameObjectives } from '@app/classes/objectives/game-objectives';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { WordPlacement } from '@app/classes/word-finding';
import { generateGameObjectives } from '@app/constants/objectives-test.const';
import * as chai from 'chai';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Container } from 'typedi';
import ObjectivesService from './objectives.service';

const validationParameters: ValidationParameters = {
    game: undefined as unknown as Game,
    wordPlacement: undefined as unknown as WordPlacement,
    scoredPoints: 0,
    createdWords: [],
};

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

    it('validateGameObjectives should call isValid on every objective', () => {
        const gameObjectives: GameObjectives = generateGameObjectives();
        chai.spy.on(gameObjectives, 'getAllObjectives', () => {
            const obj = [...gameObjectives.publicObjectives.values()];
            obj.push(gameObjectives.player1Objective);
            obj.push(gameObjectives.player2Objective);
            return obj;
        });

        const isValidSpies: unknown[] = [];
        gameObjectives.getAllObjectives().forEach((obj) => {
            const isValidSpy = chai.spy.on(obj, 'isValid');
            isValidSpies.push(isValidSpy);
        });

        service.validateGameObjectives(gameObjectives, validationParameters);
        isValidSpies.forEach((spy) => {
            expect(spy).to.have.been.called.with(validationParameters);
        });
    });
});
