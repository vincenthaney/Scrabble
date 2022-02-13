/* eslint-disable max-lines */
// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */

import { GameConfigData, StartMultiplayerGameData } from '@app/classes/game/game-config';
import Game from '@app/classes/game/game';
import { GameType } from '@app/classes/game/game.type';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import * as Errors from '@app/constants/errors';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { GameDispatcherService } from './game-dispatcher.service';
import * as GameDispatcherError from './game-dispatcher.service.error';
import { Round } from '@app/classes/round/round';
import RoundManager from '@app/classes/round/round-manager';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { LetterValue, TileReserve } from '@app/classes/tile';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { Board } from '@app/classes/board';
const expect = chai.expect;

const DEFAULT_MULTIPLAYER_CONFIG_DATA: GameConfigData = {
    playerId: 'id',
    playerName: 'player',
    gameType: GameType.Classic,
    maxRoundTime: 1,
    dictionary: 'francais',
};

const DEFAULT_OPPONENT_ID = 'opponent_id';
const DEFAULT_OPPONENT_NAME = 'opponent';
const DEFAULT_OPPONENT_ID_2 = 'opponent_id_2';
const DEFAULT_OPPONENT_NAME_2 = 'opponent 2';

chai.use(spies);
chai.use(chaiAsPromised);

describe('GameDispatcherService', () => {
    let gameDispatcherService: GameDispatcherService;

    beforeEach(() => {
        Container.reset();
        gameDispatcherService = Container.get(GameDispatcherService);
    });

    it('should create', () => {
        expect(gameDispatcherService).to.exist;
    });

    it('should initiate an empty WaitingRoom in list', () => {
        expect(gameDispatcherService['waitingRooms']).to.be.empty;
    });

    describe('createMultiplayerGame', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
        });

        it('should create a WaitingRoom', () => {
            expect(gameDispatcherService['waitingRooms']).to.have.lengthOf(1);
        });

        it('should create a WaitingRoom with same config', () => {
            expect(waitingRoom.getConfig().player1.name).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
            expect(waitingRoom.getConfig().player1.id).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(waitingRoom.getConfig().gameType).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.gameType);
            expect(waitingRoom.getConfig().maxRoundTime).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.maxRoundTime);
            expect(waitingRoom.getConfig().dictionary).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.dictionary);
        });

        it('should return game id', () => {
            expect(id).to.equal(waitingRoom.getId());
        });
    });

    describe('requestJoinGame', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
        });

        it('should add the player to the waiting game', () => {
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

            expect(waitingRoom.joinedPlayer?.id).to.equal(DEFAULT_OPPONENT_ID);
            expect(waitingRoom.joinedPlayer?.name).to.equal(DEFAULT_OPPONENT_NAME);
        });

        it('should not join if a player is already waiting', () => {
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

            expect(() => {
                gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID_2, DEFAULT_OPPONENT_NAME_2);
            }).to.throw(GameDispatcherError.PLAYER_ALREADY_TRYING_TO_JOIN);
        });

        it('should not join if initiating players have the same name', () => {
            expect(() => {
                gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
            }).to.throw(GameDispatcherError.CANNOT_HAVE_SAME_NAME);
        });
    });

    describe('acceptJoinRequest', () => {
        let id: string;
        let spy: unknown;
        let gameStub: SinonStubbedInstance<Game>;
        let tileReserveStub: SinonStubbedInstance<TileReserve>;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            tileReserveStub = createStubInstance(TileReserve);
            tileReserveStub.init.returns(Promise.resolve());
            gameStub = createStubInstance(Game);
            gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;
            spy = chai.spy.on(gameDispatcherService['activeGameService'], 'beginMultiplayerGame', async () =>
                Promise.resolve(gameStub as unknown as Game),
            );
            spy = chai.spy.on(gameDispatcherService, 'createStartGameData', () => {
                return;
            });
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should remove waitingRoom', async () => {
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.not.be.empty;

            await gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it('should call beginMultiplayerGame', async () => {
            await gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            expect(spy).to.have.been.called();
        });

        it(' should throw error when playerId is invalid', () => {
            const invalidId = 'invalidId';

            return expect(gameDispatcherService.acceptJoinRequest(id, invalidId, DEFAULT_OPPONENT_NAME)).to.be.rejectedWith(
                Errors.INVALID_PLAYER_ID_FOR_GAME,
            );
        });

        it(' should throw error when playerId is invalid', () => {
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            return expect(
                gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME),
            ).to.be.rejectedWith(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        });

        it(' should throw error when playerId is invalid', () => {
            return expect(
                gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2),
            ).to.be.rejectedWith(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        });
    });

    describe('rejectJoinRequest', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        it('should remove joinedPlayer from waitingRoom', () => {
            expect(waitingRoom.joinedPlayer).to.not.be.undefined;
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            expect(waitingRoom.joinedPlayer).to.be.undefined;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.rejectJoinRequest(id, invalidId, DEFAULT_OPPONENT_NAME)).to.throw(Errors.INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should throw if no player is waiting', () => {
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            expect(() => {
                return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            }).to.throw(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        });

        it('should throw error if opponent name is incorrect', () => {
            expect(() => {
                return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2);
            }).to.throw(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        });
    });

    describe('leaveLobbyRequest', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        it('should remove joinedPlayer from waitingRoom', () => {
            expect(waitingRoom.joinedPlayer).to.not.be.undefined;
            gameDispatcherService.leaveLobbyRequest(id, DEFAULT_OPPONENT_ID);
            expect(waitingRoom.joinedPlayer).to.be.undefined;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.leaveLobbyRequest(id, invalidId)).to.throw(Errors.INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should throw if player is undefined', () => {
            waitingRoom.joinedPlayer = undefined;
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.leaveLobbyRequest(id, invalidId)).to.throw(Errors.NO_OPPONENT_IN_WAITING_GAME);
        });

        it('should return the [hostPlayerId, leaverName]', () => {
            expect(gameDispatcherService.leaveLobbyRequest(id, DEFAULT_OPPONENT_ID)).to.deep.equal([
                DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId,
                DEFAULT_OPPONENT_NAME,
            ]);
        });
    });

    describe('cancelGame', () => {
        let id: string;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        });

        it('should remove waiting game from list', () => {
            gameDispatcherService.cancelGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.cancelGame(id, invalidId)).to.throw(Errors.INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('getAvailableWaitingRooms', () => {
        it('should return right amount', () => {
            const NTH_GAMES = 2;

            for (let i = 0; i < NTH_GAMES; ++i) {
                gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES);
        });

        it('should not return games with joined player', () => {
            const NTH_GAMES = 5;
            const NTH_JOINED = 2;

            for (let i = 0; i < NTH_GAMES; ++i) {
                const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
                if (i < NTH_JOINED) {
                    gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
                }
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES - NTH_JOINED);
        });
    });

    describe('getGameFromId', () => {
        let id: string;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        });

        it('should find the waitingRoom', () => {
            expect(gameDispatcherService['getGameFromId'](id)).to.exist;
        });

        it('should throw when id is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService['getGameFromId'](invalidId)).to.throw(Errors.NO_GAME_FOUND_WITH_ID);
        });
    });

    describe('createStartGameData', () => {
        const PLAYER_1_ID = 'player1Id';
        const PLAYER_2_ID = 'player2Id';
        const PLAYER_1_NAME = 'player1Name';
        const PLAYER_2_NAME = 'player2Name';
        const PLAYER_2 = new Player(PLAYER_2_ID, PLAYER_2_NAME);
        const PLAYER_1 = new Player(PLAYER_1_ID, PLAYER_1_NAME);
        const DEFAULT_TIME = 60;
        const DEFAULT_DICTIONARY = 'dict';
        const DEFAULT_GAME_ID = 'gameId';
        const DEFAULT_MAP = new Map<LetterValue, number>([
            ['A', 1],
            ['B', 2],
            ['C', 2],
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            ['F', 8],
        ]);
        const TILE_RESERVE_DATA: TileReserveData[] = [
            { letter: 'A', amount: 1 },
            { letter: 'B', amount: 2 },
            { letter: 'C', amount: 2 },
            { letter: 'F', amount: 8 },
        ];
        const TILE_RESERVE_TOTAL = 13;
        let gameStub: SinonStubbedInstance<Game>;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let round: Round;
        let boardStub: SinonStubbedInstance<Board>;
        let game: Game;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            roundManagerStub = createStubInstance(RoundManager);
            boardStub = createStubInstance(Board);

            roundManagerStub.getMaxRoundTime.returns(DEFAULT_TIME);
            gameStub.player1 = PLAYER_1;
            gameStub.player2 = PLAYER_2;
            gameStub.getTilesLeftPerLetter.returns(DEFAULT_MAP);
            gameStub.gameType = GameType.Classic;
            gameStub.dictionnaryName = DEFAULT_DICTIONARY;
            gameStub.getId.returns(DEFAULT_GAME_ID);
            gameStub.board = boardStub;
            gameStub.board.grid = [[]];
            gameStub.roundManager = roundManagerStub as unknown as RoundManager;

            round = { player: gameStub.player1, startTime: new Date(), limitTime: new Date() };
            roundManagerStub.getCurrentRound.returns(round);

            game = gameStub as unknown as Game;
        });

        it('should return the expected StartMultiplayerGameData', () => {
            const result = gameDispatcherService['createStartGameData'](game);
            const expectedMultiplayerGameData: StartMultiplayerGameData = {
                player1: gameStub.player1,
                player2: gameStub.player2,
                gameType: gameStub.gameType,
                maxRoundTime: DEFAULT_TIME,
                dictionary: DEFAULT_DICTIONARY,
                gameId: DEFAULT_GAME_ID,
                board: gameStub.board.grid,
                tileReserve: TILE_RESERVE_DATA,
                tileReserveTotal: TILE_RESERVE_TOTAL,
                round,
            };
            expect(result).to.deep.equal(expectedMultiplayerGameData);
        });
    });
});
