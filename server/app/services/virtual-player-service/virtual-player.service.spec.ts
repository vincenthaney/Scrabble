import { ActionData, ActionType } from '@app/classes/communication/action-data';
import { VirtualPlayerService } from './virtual-player.service';
import { StatusCodes } from 'http-status-codes';
import * as mockttp from 'mockttp'
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { environment } from '@app/environments/environment';
import Player from '@app/classes/player/player';
import Game from '@app/classes/game/game';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { GAME_SHOULD_CONTAIN_ROUND } from '@app/constants/virtual-player-constants';
import { GameConfig, StartGameData } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game-type';
import { Square } from '@app/classes/square';

const expect = chai.expect;

chai.use(spies);
const DEFAULT_PLAYER1_NAME = 'p1';
const DEFAULT_PLAYER1_ID = 'id1'
const DEFAULT_PLAYER_1 = new Player(DEFAULT_PLAYER1_NAME, DEFAULT_PLAYER1_ID);
const DEFAULT_PLAYER_2 = new Player('2', 'p2');
const DEFAULT_GAME_ID = 'grossePartie';
const DEFAULT_DICTIONARY = 'french';
const DEFAULT_MAX_ROUND_TIME = 1;

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER1_ID, DEFAULT_PLAYER1_NAME),
    gameType: GameType.Classic,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: DEFAULT_DICTIONARY,
};

const DEFAULT_STARTING_GAME_DATA: StartGameData = {
    
    ...DEFAULT_GAME_CONFIG,
    gameId: DEFAULT_GAME_ID,
    board: undefined as unknown as Square[][],
    tileReserve: [],
    player2: DEFAULT_PLAYER_2,
    round: { playerData: {id: DEFAULT_PLAYER1_ID}, startTime: new Date(), limitTime: new Date() }
};

const DEFAULT_GAME = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    id: DEFAULT_GAME_ID,

    getPlayer: () => { return new BeginnerVirtualPlayer(DEFAULT_GAME_ID, DEFAULT_PLAYER1_NAME)},
};

const DEFAULT_GAME_UPDATE_DATA = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    isGameOver: false,
}

describe('VirtualPlayerService', () => {
    let virtualPlayerService: VirtualPlayerService;
    let mockServer: mockttp.Mockttp;
    beforeEach(() => {
        mockServer = mockttp.getLocal();
        virtualPlayerService = new VirtualPlayerService();
    });

    describe('isIdVirtualPlayer', () => {
        it('should return true when id belongs to virtual player', async () => {
            const TEST_ID = 'virtual-player-1234';
            expect(VirtualPlayerService.isIdVirtualPlayer(TEST_ID)).to.be.true;
        });

        it("should return false when id doesn't belong to virtual player", async () => {
            const TEST_ID = '1234'
            expect(VirtualPlayerService.isIdVirtualPlayer(TEST_ID)).to.be.false;
        });
    });    

    describe('sendAction', () => {
        it('should call fetch', async () => {
            const TEST_GAME_ID = 'coocookachoo';
            const TEST_PLAYER_ID = 'IAmTheWalrus';
            const TEST_ACTION: ActionData = { type: ActionType.PLACE, input: '', payload: {} };
            const endpoint = `/games/${TEST_GAME_ID}/players/${TEST_PLAYER_ID}/action`;
            chai.spy.on(virtualPlayerService, 'getEndpoint', () => {mockServer.url})
            await mockServer.forPost(endpoint).thenReply(StatusCodes.NO_CONTENT, 'Action played');
            const response = virtualPlayerService.sendAction(TEST_GAME_ID, TEST_PLAYER_ID, TEST_ACTION);
            console.log((await response));
            expect(response).to.equal('Action played');
        });
    });

    describe('getEndPoint', () => {
        it('should return endpoint', async () => {
            expect(virtualPlayerService['getEndPoint']).to.equal(environment.serverUrl);
        });
    });

    describe('triggerVirtualPlayerTurn', () => {
        it('should throw when game contains no round', () => {
            expect(() => virtualPlayerService.triggerVirtualPlayerTurn(DEFAULT_GAME_UPDATE_DATA, DEFAULT_GAME as unknown as Game)).to.throw(GAME_SHOULD_CONTAIN_ROUND);
        });

        it('should call game.getplayer', () => {
            const getPlayerSpy = chai.spy.on(DEFAULT_GAME, 'getPlayer')
            virtualPlayerService.triggerVirtualPlayerTurn(DEFAULT_STARTING_GAME_DATA, DEFAULT_GAME as unknown as Game);
            expect(getPlayerSpy).to.have.been.called();
        })
    });

    describe('sliceVirtualPlayerToPlayer', () => {

        it('should return sliced player', async () => {
            const virtualPlayer = new BeginnerVirtualPlayer(DEFAULT_GAME_ID, DEFAULT_PLAYER1_NAME);
            expect(virtualPlayerService.sliceVirtualPlayerToPlayer(virtualPlayer)).to.be.an.instanceof(Player);
            });
    });
});
