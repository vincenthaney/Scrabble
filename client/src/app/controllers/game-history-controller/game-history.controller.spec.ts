import { TestBed } from '@angular/core/testing';

import { GameHistoryController } from './game-history.controller';

describe('GameHistoryControllerService', () => {
    let service: GameHistoryController;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameHistoryController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
