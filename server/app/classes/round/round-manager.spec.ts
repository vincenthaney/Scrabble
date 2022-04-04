/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Action, ActionExchange, ActionPass } from '@app/classes/actions';
import ActionHint from '@app/classes/actions/action-hint/action-hint';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { NO_FIRST_ROUND_EXISTS } from '@app/constants/services-errors';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { CompletedRound, Round } from './round';
import RoundManager from './round-manager';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const MAX_TRIES = 100;
const DEFAULT_MAX_ROUND_TIME = 1;
const DEFAULT_PLAYER_1 = new Player('player-1', 'Player 1');
const DEFAULT_PLAYER_2 = new Player('player-2', 'Player 2');

describe('RoundManager', () => {
    let roundManager: RoundManager;
    let actionStub: SinonStubbedInstance<Action>;
    let action: Action;
    let gameStub: SinonStubbedInstance<Game>;

    beforeEach(() => {
        roundManager = new RoundManager(DEFAULT_MAX_ROUND_TIME, DEFAULT_PLAYER_1, DEFAULT_PLAYER_2);
        actionStub = createStubInstance(ActionPass);
        action = actionStub as unknown as Action;
        gameStub = createStubInstance(Game);
    });

    it('should create', () => {
        expect(roundManager).to.exist;
    });

    describe('getNextPlayer', () => {
        it('should return random player at first round', () => {
            const firstPlayer = roundManager['getNextPlayer']();
            let nextPlayer: Player;
            let i = 0;

            do {
                nextPlayer = roundManager['getNextPlayer']();
                i++;
            } while (nextPlayer === firstPlayer && i < MAX_TRIES);

            expect(nextPlayer).to.not.equal(firstPlayer);
        });

        it('should return the other player if not first round (player 1)', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_1,
                startTime: new Date(),
                limitTime: new Date(),
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_2);
        });

        it('should return the other player if not first round (player 2)', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_2,
                startTime: new Date(),
                limitTime: new Date(),
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_1);
        });
    });

    describe('nextRound', () => {
        it('should call getNextPlayer', () => {
            const spy = chai.spy.on(roundManager, 'getNextPlayer', () => DEFAULT_PLAYER_1);
            roundManager.nextRound(action);
            expect(spy).to.have.been.called();
        });

        it('should add currentRound to completedRounds', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_1,
                startTime: new Date(),
                limitTime: new Date(),
            };
            const spy = chai.spy.on(roundManager['completedRounds'], 'push');
            roundManager.nextRound(action);

            expect(spy).to.have.been.called();
        });
    });

    describe('getPassCounter', () => {
        it('should return passCounter', () => {
            const expected = 8008135;
            roundManager['passCounter'] = expected;
            expect(roundManager.getPassCounter()).to.equal(expected);
        });
    });

    describe('getGameStartTime', () => {
        const DATE_1 = new Date();
        const DATE_2 = new Date();
        const DEFAULT_COMPLETED_ROUND: CompletedRound = {
            player: DEFAULT_PLAYER_1,
            startTime: DATE_2,
            completedTime: new Date(),
        } as CompletedRound;

        beforeEach(() => {
            roundManager['currentRound'] = { startTime: DATE_1 } as unknown as Round;
            roundManager['completedRounds'] = [DEFAULT_COMPLETED_ROUND];
        });

        it('should return startTime of current round if no completedRounds yet', () => {
            roundManager['completedRounds'] = [];
            expect(roundManager.getGameStartTime()).to.equal(DATE_1);
        });

        it('should return startTime of first completed round if it exists', () => {
            expect(roundManager.getGameStartTime()).to.equal(DATE_2);
        });

        it('should throw if no completed rounds and no current round', () => {
            roundManager['completedRounds'] = [];
            roundManager['currentRound'] = undefined as unknown as Round;
            expect(() => roundManager.getGameStartTime()).to.throw(NO_FIRST_ROUND_EXISTS);
        });
    });

    describe('getMaxRoundTime', () => {
        it('should return passCounter', () => {
            const expected = 8008135;
            roundManager['maxRoundTime'] = expected;
            expect(roundManager.getMaxRoundTime()).to.equal(expected);
        });
    });

    describe('saveCompletedRound', () => {
        it('should increment counter when action played is ActionPass', () => {
            const initial = 0;
            roundManager['passCounter'] = initial;
            const round: Round = { player: DEFAULT_PLAYER_1, startTime: new Date(), limitTime: new Date() };
            const actionPlayed: Action = new ActionPass(round.player, gameStub as unknown as Game);
            roundManager['saveCompletedRound'](round, actionPlayed);

            expect(roundManager.getPassCounter()).to.equal(initial + 1);
        });
        it('should not increment counter when action played is not ActionPass', () => {
            const initial = 0;
            roundManager['passCounter'] = initial;
            const round: Round = { player: DEFAULT_PLAYER_1, startTime: new Date(), limitTime: new Date() };
            const actionPlayed: Action = new ActionHint(round.player, gameStub as unknown as Game);
            roundManager['saveCompletedRound'](round, actionPlayed);

            expect(roundManager.getPassCounter()).to.equal(initial);
        });

        it('should reset to 0 if play something other than ActionPass', () => {
            const initial = 0;
            roundManager['passCounter'] = initial;
            const round: Round = { player: DEFAULT_PLAYER_1, startTime: new Date(), limitTime: new Date() };

            const actionPass: Action = new ActionPass(round.player, gameStub as unknown as Game);
            roundManager['saveCompletedRound'](round, actionPass);

            expect(roundManager.getPassCounter()).to.equal(initial + 1);

            const actionExchange: Action = new ActionExchange(round.player, gameStub as unknown as Game, []);
            roundManager['saveCompletedRound'](round, actionExchange);

            expect(roundManager.getPassCounter()).to.equal(0);
        });
    });

    describe('convertRoundToRoundData', () => {
        it('should convert player to playerData', () => {
            const player = new Player(DEFAULT_PLAYER_1.name, DEFAULT_PLAYER_1.id);
            player.score = 10;
            player.tiles = [];
            const round: Round = {
                player,
                startTime: new Date(),
                limitTime: new Date(),
            };
            const roundData = roundManager.convertRoundToRoundData(round);

            expect(roundData.playerData.name).to.equal(player.name);
            expect(roundData.playerData.id).to.equal(player.id);
            expect(roundData.playerData.score).to.equal(player.score);
            expect(roundData.playerData.tiles).to.equal(player.tiles);
            expect(roundData.startTime).to.equal(round.startTime);
            expect(roundData.limitTime).to.equal(round.limitTime);
        });
    });

    it('getCurrentRound should return the current currentRound', () => {
        const CURRENT_ROUND = {
            player: DEFAULT_PLAYER_1,
            startTime: new Date(),
            limitTime: new Date(),
            completedTime: null,
        };
        roundManager['currentRound'] = CURRENT_ROUND;
        roundManager.getCurrentRound();
        expect(roundManager.getCurrentRound()).to.deep.equal(CURRENT_ROUND);
    });
});
