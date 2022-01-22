import { TestBed } from '@angular/core/testing';
import { VirtualPlayerNamesService } from './virtual-player-names.service';

describe('VirtualPlayerNamesService', () => {
    let service: VirtualPlayerNamesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VirtualPlayerNamesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
