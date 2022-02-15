/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_GAME_ID, DEFAULT_LEAVER } from '@app/constants/controller-constants';
import { PlayerLeavesController } from '@app/controllers/player-leaves-controller/player-leaves.controller';
import { SocketService } from '..';
import { PlayerLeavesService } from './player-leaves.service';

describe('PlayerLeavesService', () => {
    let service: PlayerLeavesService;
    let playerLeavesController: PlayerLeavesController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule],
            providers: [PlayerLeavesController, SocketService],
        });
        service = TestBed.inject(PlayerLeavesService);
        playerLeavesController = TestBed.inject(PlayerLeavesController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call handleJoinerLeaveGame when playerLeavesController.joinerLeaveGameEvent emits', () => {
        const createGameSpy = spyOn(service, 'handleJoinerLeaveGame').and.callFake(() => {
            return;
        });
        // eslint-disable-next-line dot-notation
        playerLeavesController.joinerLeaveGameEvent.emit('testName');
        expect(createGameSpy).toHaveBeenCalledWith('testName');
    });

    it('should call handleJoinerLeaveGame when playerLeavesController.joinerLeaveGameEvent emits', () => {
        const createGameSpy = spyOn(service['gameService'], 'resetServiceData').and.callFake(() => {
            return;
        });
        // eslint-disable-next-line dot-notation
        playerLeavesController.resetGameEvent.emit();
        expect(createGameSpy).toHaveBeenCalled();
    });
    it('should call handleJoinerLeaveGame when playerLeavesController.joinerLeaveGameEvent emits', () => {
        const createGameSpy = spyOn<any>(service['gameDispatcherService'], 'resetServiceData').and.callFake(() => {});
        // eslint-disable-next-line dot-notation
        playerLeavesController.resetGameEvent.emit();
        expect(createGameSpy).toHaveBeenCalled();
    });
    it('should call handleJoinerLeaveGame when playerLeavesController.joinerLeaveGameEvent emits', () => {
        const createGameSpy = spyOn(service['roundManagerService'], 'resetServiceData').and.callFake(() => {
            return;
        });
        // eslint-disable-next-line dot-notation
        playerLeavesController.resetGameEvent.emit();
        expect(createGameSpy).toHaveBeenCalled();
    });
    it('should call handleJoinerLeaveGame when playerLeavesController.joinerLeaveGameEvent emits', () => {
        const createGameSpy = spyOn(service, 'resetServiceData').and.callFake(() => {
            return;
        });
        // eslint-disable-next-line dot-notation
        playerLeavesController.resetGameEvent.emit();
        expect(createGameSpy).toHaveBeenCalled();
    });

    it('handleJoinerLeaveGame should call joinerLeaveGameEvent.next', () => {
        const joinerLeaveGameEventSpy = spyOn(service.joinerLeaveGameEvent, 'next').and.callFake(() => {
            return;
        });
        service.handleJoinerLeaveGame(DEFAULT_LEAVER);
        expect(joinerLeaveGameEventSpy).toHaveBeenCalled();
    });

    it('handleLocalPlayerLeavesGame should call playerLeavesController.handleLeaveGame', () => {
        const handleLeaveGameSpy = spyOn(service['playerLeavesController'], 'handleLeaveGame').and.callFake(() => {
            return;
        });
        service.handleLocalPlayerLeavesGame();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('handleLeaveLobby should call playerLeavesController.handleLeaveGame if this.gameId true', () => {
        service['gameId'] = DEFAULT_GAME_ID;

        const handleLeaveGameSpy = spyOn(service['playerLeavesController'], 'handleLeaveGame').and.callFake(() => {
            return;
        });
        service.handleLeaveLobby();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('handleLeaveLobby should call resetServiceData', () => {
        const handleLeaveGameSpy = spyOn(service, 'resetServiceData').and.callFake(() => {
            return;
        });
        service.handleLeaveLobby();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('handleLeaveLobby should call gameDispatcherService.resetServiceData', () => {
        const handleLeaveGameSpy = spyOn<any>(service['gameDispatcherService'], 'resetServiceData').and.callFake(() => {});
        service.handleLeaveLobby();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('resetServiceData should modify gameId attribute to empty string', () => {
        service.resetServiceData();
        expect(service['gameId']).toEqual('');
    });

    it('ngOnDestroy should call serviceDestroyed$.next', () => {
        const nextSpy = spyOn(service.serviceDestroyed$, 'next').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(nextSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call serviceDestroyed$.complete', () => {
        const completeSpy = spyOn(service.serviceDestroyed$, 'complete').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(completeSpy).toHaveBeenCalled();
    });
});
