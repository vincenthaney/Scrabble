/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Action, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '@app/classes/actions';
import { Orientation } from '@app/classes/board';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from '@app/constants/services-errors';
import RoundManager from '@app/classes/round/round-manager';
import { Round } from '@app/classes/round/round';
import { LetterValue, TileReserve } from '@app/classes/tile';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import { expect } from 'chai';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub, restore } from 'sinon';
import { Container } from 'typedi';

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = '1';
const INVALID_PLAYER_ID = 'invalid-id';
const DEFAULT_PLAYER_NAME = 'player 1';
const DEFAULT_PLAYER_SCORE = 5;
const DEFAULT_ACTION: ActionData = { type: 'exchange', payload: {} };
const INVALID_ACTION_TYPE = 'invalid action type';
const DEFAULT_GET_TILES_PER_LETTER_ARRAY: [LetterValue, number][] = [
    ['A', 1],
    ['B', 2],
    ['C', 3],
    ['D', 0],
    ['E', 2],
];

describe('GamePlayService', () => {
    let gamePlayService: GamePlayService;
    let getGameStub: SinonStub;
    let gameStub: SinonStubbedInstance<Game>;
    let roundManagerStub: SinonStubbedInstance<RoundManager>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let round: Round;
    let player: Player;
    let game: Game;

    beforeEach(() => {
        gamePlayService = Container.get(GamePlayService);
        gameStub = createStubInstance(Game);
        roundManagerStub = createStubInstance(RoundManager);
        tileReserveStub = createStubInstance(TileReserve);

        gameStub.player1 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
        gameStub.getRequestingPlayer.returns(gameStub.player1);
        gameStub.roundManager = roundManagerStub as unknown as RoundManager;
        gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;

        round = { player: gameStub.player1, startTime: new Date(), limitTime: new Date() };
        roundManagerStub.nextRound.returns(round);

        gameStub.getTilesLeftPerLetter.returns(new Map(DEFAULT_GET_TILES_PER_LETTER_ARRAY));
        gameStub.endOfGame.returns([DEFAULT_PLAYER_SCORE, DEFAULT_PLAYER_SCORE]);

        player = gameStub.player1;
        game = gameStub as unknown as Game;

        getGameStub = stub(gamePlayService['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
    });

    afterEach(() => {
        getGameStub.restore();
    });

    describe('playAction', () => {
        let actionStub: SinonStubbedInstance<Action>;
        let getActionStub: SinonStub;

        beforeEach(() => {
            actionStub = createStubInstance(ActionPass);
            actionStub.willEndTurn.returns(true);
            getActionStub = stub(gamePlayService, 'getAction').returns(actionStub as unknown as Action);
            actionStub.getMessage.returns('');
            actionStub.getOpponentMessage.returns('');
        });

        afterEach(() => {
            restore();
        });

        it('should call getGame', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(getGameStub.called).to.be.true;
        });

        it('should call getMessage', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.getMessage.called).to.be.true;
        });

        it('should call getOpponentMessage', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.getOpponentMessage.called).to.be.true;
        });

        it('should call getAction', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(getActionStub.called).to.be.true;
        });

        it('should call execute', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.execute.called).to.be.true;
        });

        it('should call isGameOver', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(gameStub.isGameOver.called).to.be.true;
        });

        it('should set isGameOver to true if gameOver (updatedData exists #1)', () => {
            gameStub.isGameOver.returns(true);
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({ tileReserve: [{ letter: 'A', amount: 3 }] } as GameUpdateData);
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.isGameOver).to.be.true;
        });

        it('should set isGameOver to true if gameOver (updatedData exists #2)', () => {
            gameStub.isGameOver.returns(true);
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({ player1: { score: DEFAULT_PLAYER_SCORE }, player2: { score: DEFAULT_PLAYER_SCORE } } as GameUpdateData);
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.isGameOver).to.be.true;
        });

        it("should set isGameOver to true if gameOver (updatedData doesn't exists)", () => {
            gameStub.isGameOver.returns(true);
            actionStub.willEndTurn.returns(true);

            actionStub.execute.callsFake(() => {
                return;
            });

            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.isGameOver).to.be.true;
        });

        it('should call next round when action ends turn', () => {
            actionStub.willEndTurn.returns(true);
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(roundManagerStub.nextRound.called).to.be.true;
        });

        it('should set round action end turn (updatedData exists)', () => {
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({});
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.round).to.exist;
        });

        it("should set round action end turn (updatedData doesn't exists)", () => {
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns(undefined);
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.round).to.exist;
        });

        it('should not call next round when action does not ends turn', () => {
            actionStub.willEndTurn.returns(false);
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(roundManagerStub.nextRound.called).to.not.be.true;
        });

        it('should throw when playerId is invalid', () => {
            expect(() => gamePlayService.playAction(DEFAULT_GAME_ID, INVALID_PLAYER_ID, DEFAULT_ACTION)).to.throw(NOT_PLAYER_TURN);
        });

        it('should return tileReserve is updateData exists', () => {
            actionStub.execute.returns({});
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.tileReserve).to.exist;

            for (const [expectedLetter, expectedAmount] of DEFAULT_GET_TILES_PER_LETTER_ARRAY) {
                expect(result[0]!.tileReserve!.some(({ letter, amount }) => expectedLetter === letter && expectedAmount === amount)).to.be.true;
            }
        });

        it('should return tileReserveTotal is updateData exists', () => {
            actionStub.execute.returns({});
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.tileReserveTotal).to.exist;
            expect(result[0]!.tileReserveTotal).to.equal(DEFAULT_GET_TILES_PER_LETTER_ARRAY.reduce((prev, [, amount]) => (prev += amount), 0));
        });
    });

    describe('getAction', () => {
        it('should fail when type is invalid', () => {
            expect(() => {
                gamePlayService.getAction(player, game, { type: INVALID_ACTION_TYPE as unknown as ActionType, payload: {} });
            }).to.throw(INVALID_COMMAND);
        });

        it('should return action of type ActionPlace when type is place', () => {
            const type = 'place';
            const payload: ActionPlacePayload = {
                tiles: [],
                startPosition: { column: 0, row: 0 },
                orientation: Orientation.Horizontal,
            };
            const action = gamePlayService.getAction(player, game, { type, payload });
            expect(action).to.be.instanceOf(ActionPlace);
        });

        it('should return action of type ActionExchange when type is exchange', () => {
            const type = 'exchange';
            const payload: ActionExchangePayload = {
                tiles: [],
            };
            const action = gamePlayService.getAction(player, game, { type, payload });
            expect(action).to.be.instanceOf(ActionExchange);
        });

        it('should return action of type ActionPass when type is pass', () => {
            const type = 'pass';
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload });
            expect(action).to.be.instanceOf(ActionPass);
        });

        it('should return action of type ActionHelp when type is help', () => {
            const type = 'help';
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload });
            expect(action).to.be.instanceOf(ActionHelp);
        });

        it('should return action of type ActionReserve when type is reserve', () => {
            const type = 'reserve';
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload });
            expect(action).to.be.instanceOf(ActionReserve);
        });

        it("should throw if place payload doesn't have tiles", () => {
            const type = 'place';
            const payload: Omit<ActionPlacePayload, 'tiles'> = {
                startPosition: { column: 0, row: 0 },
                orientation: Orientation.Horizontal,
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if place payload doesn't have startPosition", () => {
            const type = 'place';
            const payload: Omit<ActionPlacePayload, 'startPosition'> = {
                tiles: [],
                orientation: Orientation.Horizontal,
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if place payload doesn't have orientation", () => {
            const type = 'place';
            const payload: Omit<ActionPlacePayload, 'orientation'> = {
                tiles: [],
                startPosition: { column: 0, row: 0 },
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if exchange payload doesn't have tiles", () => {
            const type = 'exchange';
            const payload: Omit<ActionExchangePayload, 'tiles'> = {};
            expect(() => gamePlayService.getAction(player, game, { type, payload })).to.throw(INVALID_PAYLOAD);
        });
    });
});
