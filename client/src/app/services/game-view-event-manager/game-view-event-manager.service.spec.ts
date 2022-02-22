import { TestBed } from '@angular/core/testing';
import { GameViewEventManagerService } from './game-view-event-manager.service';

describe('GameViewEventManagerService', () => {
    let service: GameViewEventManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameViewEventManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
