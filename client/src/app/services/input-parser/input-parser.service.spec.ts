import { TestBed } from '@angular/core/testing';
import { InputParserService } from '@app/services';

describe('InputParserService', () => {
    let service: InputParserService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InputParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
