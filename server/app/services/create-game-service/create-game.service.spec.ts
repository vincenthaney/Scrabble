/* eslint-disable dot-notation */
import { GameConfig, GameConfigData } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { DictionarySummary } from '@app/classes/dictionary/dictionary-data';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { CreateGameService } from './create-game.service';
chai.use(spies);
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_DICTIONARY: DictionarySummary = { title: 'french', description: 'desc', id: 'frenchid' };

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
    dictionary: DEFAULT_DICTIONARY,
};

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME),
    gameType: GameType.Classic,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: DEFAULT_DICTIONARY,
};

describe('CreateGameService', async () => {
    let createGameService: CreateGameService;
    let activeGameService: ActiveGameService;
    beforeEach(() => {
        activeGameService = Container.get(ActiveGameService);
        createGameService = new CreateGameService(activeGameService);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    describe('createSoloGame', () => {
        it('should call activeGameService.beginGame', () => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return;
            });
            spy.on(createGameService, 'generateReadyGameConfig', () => {
                return;
            });
            const beginGameSpy = spy.on(activeGameService, 'beginGame', () => {
                return;
            });
            createGameService.createSoloGame(DEFAULT_GAME_CONFIG_DATA);
            expect(beginGameSpy).to.have.been.called();
        });

        it('should call generateReadyGameConfig', () => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return DEFAULT_GAME_CONFIG;
            });
            spy.on(activeGameService, 'beginGame', () => {
                return;
            });
            const generateReadyGameConfigSpy = spy.on(createGameService, 'generateReadyGameConfig', () => {
                return;
            });
            createGameService.createSoloGame(DEFAULT_GAME_CONFIG_DATA);
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
