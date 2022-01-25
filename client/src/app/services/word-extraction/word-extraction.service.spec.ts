import { TestBed } from '@angular/core/testing';
import { WordExtractionService } from '@app/services';

describe('WordExtractionService', () => {
    let service: WordExtractionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WordExtractionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
