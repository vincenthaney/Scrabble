import { TestBed } from '@angular/core/testing';
import { VirtualPlayerProfilesService } from '@app/services';

describe('VirtualPlayerProfilesService', () => {
    let service: VirtualPlayerProfilesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VirtualPlayerProfilesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});