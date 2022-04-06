/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionPass } from '@app/classes/actions';
import { ActionData, ActionType } from '@app/classes/communication/action-data';
import Game from '@app/classes/game/game';
import { GameConfig, StartGameData } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { GAME_SHOULD_CONTAIN_ROUND } from '@app/constants/virtual-player-constants';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import * as mockttp from 'mockttp';
import { VirtualPlayerService } from './virtual-player.service';

chai.use(spies);
const DEFAULT_PLAYER1_NAME = 'p1';
const DEFAULT_PLAYER1_ID = 'id1';
const DEFAULT_PLAYER_1 = new Player(DEFAULT_PLAYER1_NAME, DEFAULT_PLAYER1_ID);
const DEFAULT_PLAYER_2 = new Player('2', 'p2');
const DEFAULT_GAME_ID = 'grossePartie';
const DEFAULT_DICTIONARY = 'french';
const DEFAULT_MAX_ROUND_TIME = 1;

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER1_ID, DEFAULT_PLAYER1_NAME),
    gameType: GameType.Classic,
    gameMode: GameMode.Solo,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: DEFAULT_DICTIONARY,
};

const DEFAULT_STARTING_GAME_DATA: StartGameData = {
    ...DEFAULT_GAME_CONFIG,
    gameId: DEFAULT_GAME_ID,
    board: undefined as unknown as Square[][],
    tileReserve: [],
    player2: DEFAULT_PLAYER_2,
    round: { playerData: { id: DEFAULT_PLAYER1_ID }, startTime: new Date(), limitTime: new Date() },
};

const DEFAULT_GAME = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    id: DEFAULT_GAME_ID,

    getPlayer: () => {
        return new BeginnerVirtualPlayer(DEFAULT_GAME_ID, DEFAULT_PLAYER1_NAME);
    },
};

const DEFAULT_GAME_UPDATE_DATA = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    isGameOver: false,
};

const PORT_NUMBER = 3000;

describe('VirtualPlayerService', () => {
    let virtualPlayerService: VirtualPlayerService;
    let mockServer: mockttp.Mockttp;

    beforeEach(async () => {
        virtualPlayerService = new VirtualPlayerService();
    });

    describe('sendAction', () => {
        const TEST_GAME_ID = 'coocookachoo';
        const TEST_PLAYER_ID = 'IAmTheWalrus';
        let TEST_ACTION: ActionData;
        beforeEach(async () => {
            mockServer = mockttp.getLocal();
            await mockServer.start(PORT_NUMBER);
        });

        afterEach(() => {
            mockServer.stop();
        });

        it('should call fetch', async () => {
            TEST_ACTION = { type: ActionType.PLACE, input: '', payload: {} };
            const endpoint = `/api/games/${TEST_GAME_ID}/players/${TEST_PLAYER_ID}/action`;
            chai.spy.on(virtualPlayerService, 'getEndpoint', () => mockServer.url);
            await mockServer.forPost(endpoint).thenReply(StatusCodes.NO_CONTENT);
            const response = await virtualPlayerService.sendAction(TEST_GAME_ID, TEST_PLAYER_ID, TEST_ACTION);
            expect(response.status).to.equal(StatusCodes.NO_CONTENT);
        });

        it('should call fetch, get an error then fetch with an Action Pass', async () => {
            TEST_ACTION = { type: ActionType.PLACE, input: '', payload: {} };
            const endpoint = `/api/games/${TEST_GAME_ID}/players/${TEST_PLAYER_ID}/action`;
            chai.spy.on(virtualPlayerService, 'getEndpoint', () => mockServer.url);
            await mockServer.forPost(endpoint).once().thenReply(StatusCodes.BAD_REQUEST);
            const sendActionSpy = chai.spy.on(ActionPass, 'createActionData');
            await virtualPlayerService.sendAction(TEST_GAME_ID, TEST_PLAYER_ID, TEST_ACTION);
            expect(sendActionSpy).to.have.been.called();
            mockServer.stop();
        });
    });

    describe('triggerVirtualPlayerTurn', () => {
        it('should throw when game contains no round', () => {
            expect(() => virtualPlayerService.triggerVirtualPlayerTurn(DEFAULT_GAME_UPDATE_DATA, DEFAULT_GAME as unknown as Game)).to.throw(
                GAME_SHOULD_CONTAIN_ROUND,
            );
        });

        it('should call game.getplayer', () => {
            const getPlayerSpy = chai.spy.on(DEFAULT_GAME, 'getPlayer');
            virtualPlayerService.triggerVirtualPlayerTurn(DEFAULT_STARTING_GAME_DATA, DEFAULT_GAME as unknown as Game);
            expect(getPlayerSpy).to.have.been.called();
        });
    });

    describe('sliceVirtualPlayerToPlayer', () => {
        it('should return sliced player', async () => {
            const virtualPlayer = new BeginnerVirtualPlayer(DEFAULT_GAME_ID, DEFAULT_PLAYER1_NAME);
            expect(virtualPlayerService.sliceVirtualPlayerToPlayer(virtualPlayer)).to.be.an.instanceof(Player);
        });
    });
});
