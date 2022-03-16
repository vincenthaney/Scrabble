/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { ActionService } from './action.service';

const DEFAULT_PLAYER_ID = DEFAULT_PLAYER.id;
const DEFAULT_GAME_ID = 'some id';

describe('ActionService', () => {
    let service: ActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(ActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service['preSendActionCallbacksMap']).toBeTruthy();
    });
});
