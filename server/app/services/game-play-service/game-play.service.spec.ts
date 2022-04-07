/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Action, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '@app/classes/actions';
import ActionHint from '@app/classes/actions/action-hint/action-hint';
import { Orientation } from '@app/classes/board';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/communication/action-data';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { RoundData } from '@app/classes/communication/round-data';
import Game from '@app/classes/game/game';
import { GameType } from '@app/classes/game/game-type';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round/round';
import RoundManager from '@app/classes/round/round-manager';
import { LetterValue, Tile, TileReserve } from '@app/classes/tile';
import { INVALID_COMMAND, INVALID_PAYLOAD } from '@app/constants/services-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { getDictionaryTestService } from '@app/services/dictionary-service/dictionary-test.service.spec';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import GameHistoriesService from '@app/services/game-histories-service/game-histories.service';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import HighScoresService from '@app/services/high-scores-service/high-scores.service';
import * as chai from 'chai';
import { EventEmitter } from 'events';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
const expect = chai.expect;

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = '1';
const INVALID_PLAYER_ID = 'invalid-id';
const DEFAULT_PLAYER_NAME = 'player 1';
const DEFAULT_PLAYER_SCORE = 5;
const DEFAULT_INPUT = 'input';
const DEFAULT_ACTION: ActionData = { type: ActionType.EXCHANGE, payload: { tiles: [] }, input: DEFAULT_INPUT };
const INVALID_ACTION_TYPE = 'invalid action type';
const DEFAULT_GET_TILES_PER_LETTER_ARRAY: [LetterValue, number][] = [
    ['A', 1],
    ['B', 2],
    ['C', 3],
    ['D', 0],
    ['E', 2],
];
const DEFAULT_ACTION_MESSAGE = 'default action message';
const DEFAULT_TILES: Tile[] = [
    {
        letter: 'A',
        value: 1,
        isBlank: false,
    },
];

describe.only('GamePlayService', () => {
    let gamePlayService: GamePlayService;
    let getGameStub: SinonStub;
    let gameStub: SinonStubbedInstance<Game>;
    let roundManagerStub: SinonStubbedInstance<RoundManager>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let round: Round;
    let player: Player;
    let game: Game;
    const initGamePlayService = Container.get(GamePlayService);

    beforeEach(() => {
        Container.reset();
    });

    beforeEach(() => {
        Container.set(DictionaryService, getDictionaryTestService());

        gamePlayService = initGamePlayService;
        gameStub = createStubInstance(Game);
        roundManagerStub = createStubInstance(RoundManager);
        tileReserveStub = createStubInstance(TileReserve);

        gameStub.player1 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
        gameStub.player2 = new Player(INVALID_PLAYER_ID, 'JCol');

        gameStub.getPlayer.returns(gameStub.player1);
        gameStub.roundManager = roundManagerStub as unknown as RoundManager;
        gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;
        gameStub.dictionarySummary = { id: 'id' } as unknown as DictionarySummary;

        round = { player: gameStub.player1, startTime: new Date(), limitTime: new Date() };
        roundManagerStub.nextRound.returns(round);

        gameStub.endOfGame.returns([DEFAULT_PLAYER_SCORE, DEFAULT_PLAYER_SCORE]);
        gameStub.endGameMessage.returns([]);
        gameStub.getConnectedRealPlayers.returns([gameStub.player1]);
        gameStub['getTilesLeftPerLetter'].returns(new Map(DEFAULT_GET_TILES_PER_LETTER_ARRAY));

        player = gameStub.player1;
        game = gameStub as unknown as Game;

        getGameStub = stub(gamePlayService['activeGameService'], 'getGame').returns(game);
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    describe('playAction', () => {
        let actionStub: SinonStubbedInstance<Action>;
        let getActionStub: SinonStub;

        beforeEach(() => {
            actionStub = createStubInstance(ActionPass);
            actionStub.willEndTurn.returns(true);
            getActionStub = stub(gamePlayService, 'getAction').returns(actionStub as unknown as Action);
            actionStub.getMessage.returns(DEFAULT_ACTION_MESSAGE);
            actionStub.getOpponentMessage.returns(DEFAULT_ACTION_MESSAGE);
        });

        afterEach(() => {
            sinon.restore();
            chai.spy.restore();
        });

        it('should call getGame', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(getGameStub.called).to.be.true;
        });

        it('should call getMessage', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(actionStub.getMessage.called).to.be.true;
        });

        it('should call getOpponentMessage', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(actionStub.getOpponentMessage.called).to.be.true;
        });

        it('should call getAction', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(getActionStub.called).to.be.true;
        });

        it('should call execute', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(actionStub.execute.called).to.be.true;
        });

        it('should call isGameOver', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(gameStub.areGameOverConditionsMet.called).to.be.true;
        });

        it('should call handleGameOver if gameOver ', async () => {
            gameStub.areGameOverConditionsMet.returns(true);
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({ tileReserve: [{ letter: 'A', amount: 3 }] } as GameUpdateData);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(gamePlayService, 'handleGameOver', () => {});
            const result = await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(result).to.exist;
            expect(spy).to.have.been.called();
        });

        it('should call next round when action ends turn', async () => {
            actionStub.willEndTurn.returns(true);
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(roundManagerStub.nextRound.called).to.be.true;
        });

        it('should set round action end turn (updatedData exists)', async () => {
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({});
            roundManagerStub.convertRoundToRoundData.returns({} as RoundData);
            const result = await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.round).to.exist;
        });

        it("should set round action end turn (updatedData doesn't exists)", async () => {
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns(undefined);
            roundManagerStub.convertRoundToRoundData.returns({} as RoundData);
            const result = await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.round).to.exist;
        });

        it('should not call next round when action does not ends turn', async () => {
            actionStub.willEndTurn.returns(false);
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(roundManagerStub.nextRound.called).to.not.be.true;
        });

        it('should throw when playerId is invalid', async () => {
            await expect(gamePlayService.playAction(DEFAULT_GAME_ID, INVALID_PLAYER_ID, DEFAULT_ACTION)).to.be.rejectedWith(Error);
        });

        it('should return tileReserve if updatedData exists', async () => {
            actionStub.execute.returns({});
            const result = await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.tileReserve).to.exist;

            for (const [expectedLetter, expectedAmount] of DEFAULT_GET_TILES_PER_LETTER_ARRAY) {
                expect(result[0]!.tileReserve!.some(({ letter, amount }) => expectedLetter === letter && expectedAmount === amount)).to.be.true;
            }
        });

        it('should call getMessage from action', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(actionStub.getMessage.calledOnce).to.be.true;
        });

        it('should call getOpponentMessage from action', async () => {
            await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(actionStub.getOpponentMessage.calledOnce).to.be.true;
        });

        it('should return opponentFeedback equal to getOppnentMessage from action', async () => {
            const [, feedback] = await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION);
            expect(feedback!.opponentFeedback).to.equal(DEFAULT_ACTION_MESSAGE);
        });

        it('should return [undefined, undefined] is game is over', async () => {
            game.gameIsOver = true;
            expect(await gamePlayService.playAction(DEFAULT_GAME_ID, player.id, DEFAULT_ACTION)).to.deep.equal([undefined, undefined]);
        });
    });

    describe('getAction', () => {
        it('should fail when type is invalid', () => {
            expect(() => {
                gamePlayService.getAction(player, game, {
                    type: INVALID_ACTION_TYPE as unknown as ActionType,
                    payload: { tiles: [] },
                    input: DEFAULT_INPUT,
                });
            }).to.throw(INVALID_COMMAND);
        });

        it('should return action of type ActionPlace when type is place', () => {
            const type = ActionType.PLACE;
            chai.spy.on(gamePlayService, 'getActionPlacePayload', () => {
                return { startPosition: { column: 0, row: 0 } };
            });
            const payload: ActionPlacePayload = {
                tiles: [{} as unknown as Tile],
                startPosition: { column: 0, row: 0 },
                orientation: Orientation.Horizontal,
            };
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionPlace);
        });

        it('should return action of type ActionExchange when type is exchange', () => {
            const type = ActionType.EXCHANGE;
            const payload: ActionExchangePayload = {
                tiles: [{} as unknown as Tile],
            };
            chai.spy.on(gamePlayService, 'getActionExchangePayload', () => {
                return { tiles: [{} as unknown as Tile] };
            });

            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionExchange);
        });

        it('should return action of type ActionPass when type is pass', () => {
            const type = ActionType.PASS;
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionPass);
        });

        it('should return action of type ActionHelp when type is help', () => {
            const type = ActionType.HELP;
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionHelp);
        });

        it('should return action of type ActionReserve when type is reserve', () => {
            const type = ActionType.RESERVE;
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionReserve);
        });

        it('should return action of type ActionReserve when type is hint', () => {
            const type = ActionType.HINT;
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionHint);
        });

        it("should throw if place payload doesn't have tiles", () => {
            const type = ActionType.PLACE;
            const payload = {
                tiles: [],
                startPosition: { column: 0, row: 0 },
                orientation: Orientation.Horizontal,
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if place payload doesn't have startPosition", () => {
            const type = ActionType.PLACE;
            const payload: Omit<ActionPlacePayload, 'startPosition'> = {
                tiles: DEFAULT_TILES,
                orientation: Orientation.Horizontal,
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if place payload doesn't have orientation", () => {
            const type = ActionType.PLACE;
            const payload: Omit<ActionPlacePayload, 'orientation'> = {
                tiles: DEFAULT_TILES,
                startPosition: { column: 0, row: 0 },
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if exchange payload doesn't have tiles", () => {
            const type = ActionType.EXCHANGE;
            const payload = { tiles: [] };
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });
    });

    describe('getActionPlacePayload', () => {
        it('should return right payload', () => {
            const payload = {
                startPosition: { column: 1, row: 1 },
                orientation: Orientation.Horizontal,
                tiles: [{ letter: 'A', value: 2 }],
            };
            const actionData: ActionData = {
                type: ActionType.PLACE,
                input: 'test',
                payload,
            };
            expect(gamePlayService.getActionPlacePayload(actionData)).to.deep.equal(payload);
        });
    });

    describe('getActionExchangePayload', () => {
        it('should return right payload', () => {
            const payload = {
                tiles: [{ letter: 'A', value: 2 }],
            };
            const actionData: ActionData = {
                type: ActionType.EXCHANGE,
                input: 'test',
                payload,
            };
            expect(gamePlayService.getActionExchangePayload(actionData)).to.deep.equal(payload);
        });
    });

    describe('isGameOver', () => {
        it('should return expected value', () => {
            const expected = true;
            game['gameIsOver'] = expected;
            expect(gamePlayService.isGameOver(game.getId(), DEFAULT_PLAYER_ID)).to.equal(expected);
        });
    });

    describe('PlayerLeftEvent', () => {
        const playerWhoLeftId = 'playerWhoLeftId';
        let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;
        let highScoresServiceStub: SinonStubbedInstance<HighScoresService>;
        let dictionaryServiceStub: SinonStubbedInstance<DictionaryService>;
        let gameHistoriesServiceStub: SinonStubbedInstance<GameHistoriesService>;

        beforeEach(() => {
            activeGameServiceStub = createStubInstance(ActiveGameService);
            activeGameServiceStub.playerLeftEvent = new EventEmitter();
            activeGameServiceStub.getGame.returns(gameStub as unknown as Game);

            gamePlayService = new GamePlayService(
                activeGameServiceStub as unknown as ActiveGameService,
                highScoresServiceStub as unknown as HighScoresService,
                dictionaryServiceStub as unknown as DictionaryService,
                gameHistoriesServiceStub as unknown as GameHistoriesService,
            );
        });

        it('On receive player left event, should call handlePlayerLeftEvent', () => {
            const handlePlayerLeftEventSpy = chai.spy.on(gamePlayService, 'handlePlayerLeftEvent', () => {
                return;
            });
            gamePlayService['activeGameService'].playerLeftEvent.emit('playerLeft', DEFAULT_GAME_ID, playerWhoLeftId);
            expect(handlePlayerLeftEventSpy).to.have.been.called.with(DEFAULT_GAME_ID, playerWhoLeftId);
        });

        it('handlePlayerLeftEvent should emit playerLeftFeedback', async () => {
            gameStub.player1 = new Player(DEFAULT_PLAYER_ID, 'Cool Guy Name');
            gameStub.player2 = new Player(playerWhoLeftId, 'LeaverName');
            const updatedData: GameUpdateData = {};
            const endOfGameMessages: string[] = ['test'];

            chai.spy.on(gamePlayService, 'handleGameOver', async () => endOfGameMessages);
            const emitSpy = chai.spy.on(gamePlayService['activeGameService'].playerLeftEvent, 'emit', () => {
                return;
            });

            await gamePlayService['handlePlayerLeftEvent'](DEFAULT_GAME_ID, playerWhoLeftId);
            expect(emitSpy).to.have.been.called.with('playerLeftFeedback', DEFAULT_GAME_ID, endOfGameMessages, updatedData);
        });
    });

    describe('handleGameOver', () => {
        let highScoresServiceStub: SinonStubbedInstance<HighScoresService>;
        beforeEach(() => {
            highScoresServiceStub = createStubInstance(HighScoresService);
            highScoresServiceStub.addHighScore.resolves(true);
            Object.defineProperty(gamePlayService, 'highScoresService', { value: highScoresServiceStub });
            chai.spy.on(gamePlayService['dictionaryService'], 'stopUsingDictionary', () => {
                return;
            });
        });

        it('should call end of game and endgame message', async () => {
            gameStub.isAddedToDatabase = true;
            await gamePlayService['handleGameOver']('', gameStub as unknown as Game, {});
            expect(gameStub.endOfGame.calledOnce).to.be.true;
            expect(gameStub.endGameMessage.calledOnce).to.be.true;
        });

        it('should change isAddedtoDatabase', async () => {
            gameStub.isAddedToDatabase = false;
            await gamePlayService['handleGameOver']('', gameStub as unknown as Game, {});
            expect(gameStub.isAddedToDatabase).to.be.true;
        });

        it('should call getConnectedRealPlayers', async () => {
            gameStub.isAddedToDatabase = false;
            await gamePlayService['handleGameOver']('', gameStub as unknown as Game, {});
            expect(gameStub.getConnectedRealPlayers.calledOnce).to.be.true;
            expect(highScoresServiceStub.addHighScore.calledOnce).to.be.true;
        });

        it('should update set updatedData players score if they exist', async () => {
            const updatedScore1 = 100;
            const updatedScore2 = 200;
            const gameUpdateData = {
                player1: { id: 'id1', score: 0 },
                player2: { id: 'id2', score: 0 },
            };
            gameStub.endOfGame.returns([updatedScore1, updatedScore2]);

            await gamePlayService['handleGameOver']('', gameStub as unknown as Game, gameUpdateData);
            expect(gameUpdateData.player1.score).to.equal(updatedScore1);
            expect(gameUpdateData.player2.score).to.equal(updatedScore2);
        });
    });

    describe('addMissingPlayerId', () => {
        let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;

        beforeEach(() => {
            activeGameServiceStub = createStubInstance(ActiveGameService);
            activeGameServiceStub.getGame.returns(gameStub as unknown as Game);
            chai.spy.on(gamePlayService['dictionaryService'], 'stopUsingDictionary', () => {
                return;
            });
            (gamePlayService['activeGameService'] as unknown) = activeGameServiceStub;
        });

        it('should modify both ids', async () => {
            const result = gamePlayService['addMissingPlayerId']('', '', { player1: { id: 'id1' }, player2: { id: 'id2' } });
            gameStub.isAddedToDatabase = true;
            gameStub.dictionarySummary = { id: 'id' } as unknown as DictionarySummary;
            await gamePlayService['handleGameOver']('', gameStub as unknown as Game, {});
            expect(result.player1!.id).to.equal(gameStub.player1.id);
            expect(result.player2!.id).to.equal(gameStub.player2.id);
        });
    });

    it('handleResetObjectives should reset if gameType is LOG2990', () => {
        gameStub.gameType = GameType.LOG2990;
        const resetSpy = chai.spy.on(gameStub, 'resetPlayerObjectiveProgression', () => {});
        gamePlayService.handleResetObjectives(gameStub.getId(), player.id);
        expect(resetSpy).to.have.been.called();
    });

    it('handleResetObjectives should NOT reset if gameType is Classic', () => {
        gameStub.gameType = GameType.Classic;
        const resetSpy = chai.spy.on(gameStub, 'resetPlayerObjectiveProgression', () => {});
        gamePlayService.handleResetObjectives(gameStub.getId(), player.id);
        expect(resetSpy).not.to.have.been.called();
    });
});
