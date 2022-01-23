import { TestBed } from '@angular/core/testing';
import { RoundManagerService } from '@app/services';

describe('RoundManagerService', () => {
    let service: RoundManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RoundManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
