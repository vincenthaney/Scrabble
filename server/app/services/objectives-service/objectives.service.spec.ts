/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ObjectiveState } from '@app/classes/objectives/objective-state';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import Player from '@app/classes/player/player';
import { generateTestObjective, TestObjective } from '@app/constants/services-constants/objectives-test.const';
import { INVALID_PLAYER_ID_FOR_GAME, OPPONENT_HAS_NOT_OBJECTIVE } from '@app/constants/services-errors';
import { Random } from '@app/utils/random';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { SinonStub, stub } from 'sinon';
import { Container } from 'typedi';
import ObjectivesService from './objectives.service';
chai.use(spies);

const DEFAULT_PLAYER: Player = new Player('id', 'name');
const OPPONENT: Player = new Player('op', 'opponent');

describe('ObjectiveService', () => {
    let service: ObjectivesService;
    let findOpponentSpy: unknown;
    let player: Player;
    let game: Game;

    beforeEach(() => {
        service = Container.get(ObjectivesService);
        findOpponentSpy = chai.spy.on(service, 'findOpponent', () => OPPONENT);
        player = DEFAULT_PLAYER;
        game = new Game();
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('createObjectivesForGame', () => {
        let objectives: Set<AbstractObjective>;
        let createSpy: unknown;
        let randomPopSpy: unknown;

        beforeEach(() => {
            objectives = new Set([generateTestObjective(1), generateTestObjective(2), generateTestObjective(3), generateTestObjective(4)]);
            createSpy = chai.spy.on(service, 'createObjectivesPool', () => {
                return objectives;
            });
            randomPopSpy = chai.spy.on(service, 'popRandomObjectiveFromPool', (pool: Set<AbstractObjective>, n: number) => {
                const result = [...pool.values()].slice(0, n);
                result.forEach((objective: AbstractObjective) => pool.delete(objective));
                return result;
            });
        });

        it('should call createObjectivesPool', async () => {
            await service.createObjectivesForGame();
            expect(createSpy).to.have.been.called();
        });

        it('should call popRandomObjectiveFromPool', async () => {
            await service.createObjectivesForGame();
            expect(randomPopSpy).to.have.been.called.with(objectives, 2);
            expect(randomPopSpy).to.have.been.called.with(objectives, 1);
        });
    });

    describe('validatePlayerObjectives', () => {
        let validationParameters: ValidationParameters;
        let objectiveUpdateSpies: unknown[];
        let objectiveCompleteSpies: SinonStub[];
        let addToUpdateSpy: unknown;
        let handleCompleteSpy: unknown;
        let objectives: AbstractObjective[];

        beforeEach(() => {
            objectives = [generateTestObjective(1)];
            chai.spy.on(player, 'getObjectives', () => objectives);
            validationParameters = {
                game: game as unknown as Game,
            } as unknown as ValidationParameters;
            objectiveUpdateSpies = objectives.map((o: AbstractObjective) => chai.spy.on(o, 'updateObjective', () => {}));
            objectiveCompleteSpies = objectives.map((o: AbstractObjective) => stub(o, 'isCompleted').returns(false));
            addToUpdateSpy = chai.spy.on(service, 'addPlayerObjectivesToUpdateData', () => {
                return {};
            });
            handleCompleteSpy = chai.spy.on(service, 'handleObjectiveComplete', () => {});
        });

        afterEach(() => {
            objectiveCompleteSpies.forEach((s: SinonStub) => s.restore());
        });

        it('should call updateObjective on each objective of player', () => {
            service.validatePlayerObjectives(player, game, validationParameters);
            objectiveUpdateSpies.forEach((spy: unknown) => expect(spy).to.have.been.called.with(validationParameters));
        });

        it('should NOT call updateObjective if objective is COMPLETE', () => {
            objectiveCompleteSpies.forEach((s: SinonStub) => s.returns(true));
            service.validatePlayerObjectives(player, game, validationParameters);
            objectiveUpdateSpies.forEach((spy: unknown) => expect(spy).not.to.have.been.called());
        });

        it('should call handleObjectiveComplete if objective is completed by update', () => {
            objectiveCompleteSpies.forEach((s: SinonStub) => s.onFirstCall().returns(false).returns(true));
            service.validatePlayerObjectives(player, game, validationParameters);
            objectives.forEach((o: AbstractObjective) => {
                expect(handleCompleteSpy).to.have.been.called.with(o, player, game);
            });
        });

        it('should call addPlayerObjectivesToUpdateData with player', () => {
            service.validatePlayerObjectives(player, game, validationParameters);
            expect(addToUpdateSpy).to.have.been.called.with(game, player, {});
        });

        it('should call addPlayerObjectivesToUpdateData with Opponent', () => {
            service.validatePlayerObjectives(player, game, validationParameters);
            expect(findOpponentSpy).to.have.been.called.with(game, player);
            expect(addToUpdateSpy).to.have.been.called.with(game, OPPONENT, {});
        });
    });

    describe('handleObjectiveComplete', () => {
        let spy: unknown;

        beforeEach(() => {
            spy = chai.spy.on(service, 'setOpponentPublicObjectiveComplete', () => {});
        });

        it('should call setOpponentPublicObjectiveComplete if objective is public', () => {
            const objective = new TestObjective('name', 3, true);
            service['handleObjectiveComplete'](objective, player, game);
            expect(spy).to.have.been.called.with(OPPONENT, objective);
        });

        it('should NOT call setOpponentPublicObjectiveComplete if objective is private', () => {
            const objective = new TestObjective('name', 3, false);
            service['handleObjectiveComplete'](objective, player, game);
            expect(spy).not.to.have.been.called();
        });
    });

    describe('setOpponentPublicObjectiveComplete', () => {
        let objective: AbstractObjective;

        beforeEach(() => {
            objective = new TestObjective('test', 3, true);
        });

        it('should set identical objective on opponent to CompletedByOpponent', () => {
            const opponentObjective: AbstractObjective = new TestObjective('test', 3, true);
            chai.spy.on(OPPONENT, 'getObjectives', () => [opponentObjective]);
            service['setOpponentPublicObjectiveComplete'](OPPONENT, objective);
            expect(opponentObjective.state).to.equal(ObjectiveState.CompletedByOpponent);
        });

        it('should throw if no identical objective is found on opponent', () => {
            const opponentObjective: AbstractObjective = new TestObjective('differentName', 3, true);
            chai.spy.on(OPPONENT, 'getObjectives', () => [opponentObjective]);
            expect(() => service['setOpponentPublicObjectiveComplete'](OPPONENT, objective)).to.throw(OPPONENT_HAS_NOT_OBJECTIVE);
            expect(opponentObjective.state).not.to.equal(ObjectiveState.CompletedByOpponent);
        });
    });

    describe('findOpponent', () => {
        beforeEach(() => {
            chai.spy.restore();
            game.player1 = DEFAULT_PLAYER;
        });

        it('should return player with diffrent id from the one provided', () => {
            game.player2 = OPPONENT;
            expect(service['findOpponent'](game, game.player1)).to.equal(OPPONENT);
        });

        it('should throw error if no different player was found', () => {
            game.player2 = DEFAULT_PLAYER;
            expect(() => service['findOpponent'](game, game.player1)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('addPlayerObjectivesToUpdateData', () => {
        let objective: AbstractObjective;

        beforeEach(() => {
            objective = generateTestObjective(1);
            chai.spy.on(player, 'getObjectives', () => [objective]);
        });

        it('should return objective data as player 1 if player 1 is provided', () => {
            chai.spy.on(game, 'isPlayer1', () => true);

            const actual: GameObjectivesData = service['addPlayerObjectivesToUpdateData'](game, player, {});
            const expected: GameObjectivesData = { player1Objectives: [objective.convertToData()] };
            expect(actual).to.deep.equal(expected);
        });

        it('should return objective data as player 2 if player 2 is provided', () => {
            chai.spy.on(game, 'isPlayer1', () => false);

            const actual: GameObjectivesData = service['addPlayerObjectivesToUpdateData'](game, player, {});
            const expected: GameObjectivesData = { player2Objectives: [objective.convertToData()] };
            expect(actual).to.deep.equal(expected);
        });
    });

    it('createObjectivesPool should return set with objectives', async () => {
        expect(service['createObjectivesPool']()).to.exist;
    });

    it('popRandomObjectiveFromPool should pop objectives out of the pool', () => {
        const poppedObjective: AbstractObjective = generateTestObjective(1);
        const objectives: Set<AbstractObjective> = new Set([poppedObjective, generateTestObjective(2)]);
        const randomStub = stub(Random, 'getRandomElementsFromArray').returns([poppedObjective]);

        const actualObjectives: AbstractObjective[] = service['popRandomObjectiveFromPool'](objectives, 1);
        const expectedObjectives: AbstractObjective[] = [poppedObjective];

        expect(actualObjectives).to.deep.equal(expectedObjectives);
        expect(objectives.has(actualObjectives[0])).to.be.false;
        randomStub.restore();
    });

    describe('resetPlayerObjectiveProgression', () => {
        let resetSpy: unknown;
        let updateSpy: unknown;

        beforeEach(() => {
            resetSpy = chai.spy.on(player, 'resetObjectivesProgression', () => {});
            updateSpy = chai.spy.on(service, 'addPlayerObjectivesToUpdateData', () => undefined as unknown as GameObjectivesData);
        });

        it('should call reset on player', () => {
            service.resetPlayerObjectiveProgression(game, player);
            expect(resetSpy).to.have.been.called();
        });

        it('should add objectives to update', () => {
            service.resetPlayerObjectiveProgression(game, player);
            expect(updateSpy).to.have.been.called.with(game, player, {});
        });
    });
});
