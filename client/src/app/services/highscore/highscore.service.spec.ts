import { TestBed } from '@angular/core/testing';
import { HighScoreService } from './highscore.service';

describe('HighScoreService', () => {
    let service: HighScoreService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HighScoreService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
