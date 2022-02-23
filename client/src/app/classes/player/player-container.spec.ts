/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { PlayerData } from '@app/classes/communication/';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { MISSING_PLAYER_DATA_TO_INITIALIZE, PLAYER_NUMBER_INVALID } from '@app/constants/services-errors';
import { AbstractPlayer, Player } from '.';
import { PlayerContainer } from './player-container';

describe('PlayerContainer', () => {
    let playerContainer: PlayerContainer;

    const DEFAULT_LOCAL_PLAYER_ID = '1';
    const testPlayers: AbstractPlayer[] = [new Player('1', 'player1', []), new Player('2', 'player2', [])];

    beforeEach(() => {
        playerContainer = new PlayerContainer(DEFAULT_LOCAL_PLAYER_ID);
    });

    afterEach(() => {
        playerContainer = null as unknown as PlayerContainer;
    });

    it('Creating PlayerContainer should initialize set and set localPlayerId', () => {
        expect(playerContainer['players']).toBeTruthy();
        expect(playerContainer['localPlayerId']).toEqual(DEFAULT_LOCAL_PLAYER_ID);
    });

    it('getLocalPlayerId should return localPlayerId', () => {
        expect(playerContainer.getLocalPlayerId()).toEqual(playerContainer['localPlayerId']);
    });

    it('getLocalPlayer should return player from container with same id as localPlayerId', () => {
        const localPlayer = new Player(DEFAULT_LOCAL_PLAYER_ID, 'test', []);
        playerContainer['players'].add(localPlayer);

        expect(playerContainer.getLocalPlayer()).toEqual(localPlayer);
    });

    it('initializePlayer should call addPlayer if playerData is valid', () => {
        const playerData: PlayerData = {
            id: '1',
            name: 'test',
            tiles: [],
        };
        const spy = spyOn(playerContainer, 'addPlayer').and.callFake(() => {
            return playerContainer;
        });

        playerContainer.initializePlayer(playerData);
        expect(spy).toHaveBeenCalled();
    });

    it('initializePlayer should throw error if name is missing', () => {
        const playerData: PlayerData = {
            id: '1',
            tiles: [],
        };

        expect(() => playerContainer.initializePlayer(playerData)).toThrowError(MISSING_PLAYER_DATA_TO_INITIALIZE);
    });

    it('initializePlayer should throw error if tiles are missing', () => {
        const playerData: PlayerData = {
            id: '1',
            name: 'test',
        };

        expect(() => playerContainer.initializePlayer(playerData)).toThrowError(MISSING_PLAYER_DATA_TO_INITIALIZE);
    });

    it('initializePlayers should call addPlayer if playerData is valid', () => {
        const playerDatas: PlayerData[] = [
            {
                id: '1',
                name: 'test',
                tiles: [],
            },
            {
                id: '2',
                name: 'test2',
                tiles: [],
            },
        ];
        const spy = spyOn(playerContainer, 'initializePlayer').and.callFake(() => {
            return playerContainer;
        });

        playerContainer.initializePlayers(...playerDatas);
        playerDatas.forEach((data: PlayerData) => {
            expect(spy).toHaveBeenCalledWith(data);
        });
    });

    it('getPlayer 1 should return the first player in the set', () => {
        playerContainer['players'] = new Set(testPlayers);

        expect(playerContainer.getPlayer(1)).toEqual(testPlayers[0]);
    });

    it('getPlayer for player number not in set should throw error', () => {
        playerContainer['players'] = new Set(testPlayers);
        const outOfBoundNumber = playerContainer['players'].size + 1;

        expect(() => playerContainer.getPlayer(outOfBoundNumber)).toThrowError(PLAYER_NUMBER_INVALID(outOfBoundNumber));
    });

    it('addPlayer should add provided player to set', () => {
        const spy = spyOn(playerContainer['players'], 'add').and.callThrough();

        playerContainer.addPlayer(DEFAULT_PLAYER);
        expect(spy).toHaveBeenCalledWith(DEFAULT_PLAYER);
    });

    it('removePlayer should delete provided player to set', () => {
        const spy = spyOn(playerContainer['players'], 'delete').and.callThrough();

        playerContainer.addPlayer(DEFAULT_PLAYER);
        playerContainer.removePlayer(DEFAULT_PLAYER);

        expect(spy).toHaveBeenCalledWith(DEFAULT_PLAYER);
    });

    it('resetPlayers should clear the set', () => {
        const spy = spyOn(playerContainer['players'], 'clear').and.callThrough();

        playerContainer.resetPlayers();
        expect(spy).toHaveBeenCalledWith();
    });

    it('updatePlayersData should call updatePlayerData on players if the id matches', () => {
        const player1UpdateSpy = spyOn(testPlayers[0], 'updatePlayerData').and.callFake(() => {
            return;
        });
        const player2UpdateSpy = spyOn(testPlayers[1], 'updatePlayerData').and.callFake(() => {
            return;
        });
        const playerDatas: PlayerData[] = [
            {
                id: '1',
                name: 'test',
            },
            {
                id: '2',
                name: 'test2',
            },
        ];

        playerContainer.updatePlayersData(...playerDatas);
        expect(player1UpdateSpy).toHaveBeenCalledWith(playerDatas[0]);
        expect(player2UpdateSpy).toHaveBeenCalledWith(playerDatas[1]);
    });
});
