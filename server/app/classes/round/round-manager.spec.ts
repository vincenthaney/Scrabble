/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as chaiAsPromised from 'chai-as-promised';
import Player from '@app/classes/player/player';
import RoundManager from './round-manager';
import { ERROR_GAME_NOT_STARTED } from './round-manager-error';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const MAX_TRIES = 100;
const DEFAULT_MAX_ROUND_TIME = 1;
const DEFAULT_PLAYER_1 = new Player('player-1', 'Player 1');
const DEFAULT_PLAYER_2 = new Player('player-2', 'Player 2');
const DEFAULT_DATE = new Date('June 29, 2001');
// const SECONDS_TO_MILLISECONDS = 1000;

describe('RoundManager', () => {
    let roundManager: RoundManager;

    beforeEach(() => {
        roundManager = new RoundManager(DEFAULT_MAX_ROUND_TIME, DEFAULT_PLAYER_1, DEFAULT_PLAYER_2);
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
                completedTime: null,
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_2);
        });

        it('should return the other player if not first round (player 2)', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_2,
                startTime: new Date(),
                limitTime: new Date(),
                completedTime: null,
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_1);
        });
    });

    describe('getStartGameTime', () => {
        it('should throw if no rounds completed', () => {
            expect(() => roundManager.getStartGameTime()).to.throw(ERROR_GAME_NOT_STARTED);
        });

        it('should return start date of currentRound if completedRound is empty', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_1,
                startTime: DEFAULT_DATE,
                limitTime: new Date(),
                completedTime: null,
            };

            expect(roundManager['completedRounds']).to.be.empty;
            expect(roundManager.getStartGameTime()).to.equal(DEFAULT_DATE);
        });

        it('should return start date of first round in completedRound', () => {
            const nthRounds = 10;
            for (let i = 0; i < nthRounds; ++i) {
                const date = new Date(DEFAULT_DATE);
                date.setMinutes(DEFAULT_DATE.getMinutes() + i);
                roundManager['completedRounds'].push({
                    player: DEFAULT_PLAYER_1,
                    startTime: date,
                    limitTime: new Date(),
                    completedTime: null,
                });
            }

            // Compare UTC string and not date because we want to compare the value, not the instance
            expect(roundManager.getStartGameTime().toUTCString()).to.equal(DEFAULT_DATE.toUTCString());
        });
    });

    describe('nextRound', () => {
        it('should call getNextPlayer', () => {
            const spy = chai.spy.on(roundManager, 'getNextPlayer', () => DEFAULT_PLAYER_1);
            roundManager.nextRound();
            expect(spy).to.have.been.called();
        });

        it('should add currentRound to completedRounds', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_1,
                startTime: new Date(),
                limitTime: new Date(),
                completedTime: null,
            };
            const spy = chai.spy.on(roundManager['completedRounds'], 'push');
            roundManager.nextRound();

            expect(spy).to.have.been.called();
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
