import { TestBed } from '@angular/core/testing';
import { GameHistoryService } from '@app/services';

describe('GameHistoryService', () => {
    let service: GameHistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameHistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
