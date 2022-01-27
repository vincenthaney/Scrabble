import { TestBed } from '@angular/core/testing';
import { ScoreComputerService } from '@app/services';

describe('ScoreComputerService', () => {
    let service: ScoreComputerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ScoreComputerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
