/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { GameConfig, GameConfigData } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import * as BeginnerVirtualPlayer from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import * as ExpertVirtualPlayer from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import { TEST_DICTIONARY } from '@app/constants/dictionary-tests.const';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import { CreateGameService } from './create-game.service';
chai.use(spies);

const DEFAULT_PLAYER_ID = 'playerId';

const DEFAULT_MAX_ROUND_TIME = 1;

const DEFAULT_PLAYER_NAME = 'player';
const DEFAULT_GAME_CONFIG_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: DEFAULT_PLAYER_ID,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    virtualPlayerName: DEFAULT_PLAYER_NAME,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_GAME_CONFIG_DATA_EXPERT: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: DEFAULT_PLAYER_ID,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    virtualPlayerLevel: VirtualPlayerLevel.Expert,
    virtualPlayerName: DEFAULT_PLAYER_NAME,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME),
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

describe('CreateGameService', () => {
    let createGameService: CreateGameService;
    let activeGameService: ActiveGameService;

    beforeEach(() => {
        Container.reset();
    });

    beforeEach(() => {
        activeGameService = Container.get(ActiveGameService);
        createGameService = new CreateGameService(activeGameService);
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    describe('createSoloGame', () => {
        it('should call activeGameService.beginGame', async () => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return;
            });
            spy.on(createGameService, 'generateReadyGameConfig', () => {
                return;
            });
            const beginGameSpy = spy.on(activeGameService, 'beginGame', () => {
                return;
            });
            await createGameService.createSoloGame(DEFAULT_GAME_CONFIG_DATA);
            expect(beginGameSpy).to.have.been.called();
        });

        it('should add a Beginner player if it is the selected virtual player level', () => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return;
            });
            spy.on(createGameService, 'generateReadyGameConfig', () => {
                return;
            });

            spy.on(activeGameService, 'beginGame', () => {
                return;
            });

            const stub = sinon.spy(BeginnerVirtualPlayer, 'BeginnerVirtualPlayer');
            createGameService.createSoloGame(DEFAULT_GAME_CONFIG_DATA);
            expect(stub.called).to.be.true;
        });

        it('should add an Expert player if it is the selected virtual player level', () => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return;
            });
            spy.on(createGameService, 'generateReadyGameConfig', () => {
                return;
            });

            spy.on(activeGameService, 'beginGame', () => {
                return;
            });

            const stub = sinon.spy(ExpertVirtualPlayer, 'ExpertVirtualPlayer');
            createGameService.createSoloGame(DEFAULT_GAME_CONFIG_DATA_EXPERT);
            expect(stub.called).to.be.true;
        });

        it('should call generateReadyGameConfig', async () => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return DEFAULT_GAME_CONFIG;
            });
            spy.on(activeGameService, 'beginGame', () => {
                return;
            });
            const generateReadyGameConfigSpy = spy.on(createGameService, 'generateReadyGameConfig', () => {
                return;
            });
            await createGameService.createSoloGame(DEFAULT_GAME_CONFIG_DATA);
            expect(generateReadyGameConfigSpy).to.have.been.called();
        });
    });

    describe('createMultiplayerGame', () => {
        it('should call activeGameService.beginGame', () => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return;
            });
            const newWaitingRoom = createGameService.createMultiplayerGame(DEFAULT_GAME_CONFIG_DATA);
            expect(newWaitingRoom).to.be.an.instanceof(WaitingRoom);
        });
    });

    describe('generateGameConfig', () => {
        it('should call generateGameConfig', () => {
            const configSpy = spy.on(createGameService, 'generateGameConfig');
            createGameService.createMultiplayerGame(DEFAULT_GAME_CONFIG_DATA);
            expect(configSpy).to.have.been.called();
        });
    });

    describe('generateReadyGameConfig', () => {
        it('should return a ReadyGameConfig', () => {
            const DEFAULT_PLAYER_2 = new Player('testid2', 'DJ TESTO');
            const newReadyGameConfig = createGameService['generateReadyGameConfig'](DEFAULT_PLAYER_2, DEFAULT_GAME_CONFIG);
            const DEFAULT_READY_GAME_CONFIG = {
                ...DEFAULT_GAME_CONFIG,
                player2: DEFAULT_PLAYER_2,
            };
            expect(newReadyGameConfig).to.deep.equal(DEFAULT_READY_GAME_CONFIG);
        });
    });
});
