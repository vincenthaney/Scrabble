/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GameButtonActionService } from './game-button-action.service';

const DEFAULT_PLAYER_ID = DEFAULT_PLAYER.id;
const DEFAULT_GAME_ID = 'some id';

describe('GameButtonActionService', () => {
    let service: GameButtonActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(GameButtonActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createPassAction', () => {
        let getLocalPlayerIdSpy: jasmine.Spy;

        beforeEach(() => {
            getLocalPlayerIdSpy = spyOn(service['gameService'], 'getLocalPlayerId').and.returnValue(DEFAULT_PLAYER_ID);
        });

        it('should call gameservice.getLocalPlayerId', () => {
            service.createPassAction();
            expect(getLocalPlayerIdSpy).toHaveBeenCalled();
        });

        it('should throw NO_LOCAL_PLAYER if localPlayerId is undefined', () => {
            getLocalPlayerIdSpy.and.returnValue(undefined);
            expect(() => service.createPassAction()).toThrow(new Error(NO_LOCAL_PLAYER));
        });

        it('should call sendAction with valid action data', () => {
            const sendActionSpy = spyOn(service['gamePlayController'], 'sendAction').and.callFake(() => {
                return;
            });
            service['gameService'].gameId = DEFAULT_GAME_ID;
            const expectedActionData: ActionData = {
                type: ActionType.PASS,
                input: '',
                payload: {},
            };
            service.createPassAction();
            expect(sendActionSpy).toHaveBeenCalledWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, expectedActionData);
        });
    });
});
