import { TestBed } from '@angular/core/testing';
import { PlayerLeavesService } from './player-leaves.service';

describe('PlayerLeavesService', () => {
    let service: PlayerLeavesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerLeavesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
