/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerProfilesController } from './virtual-player-profiles.controller';

describe('VirtualPlayerProfilesController', () => {
    let service: VirtualPlayerProfilesController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(VirtualPlayerProfilesController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getVirtualPlayerProfiles', () => {
        it('should call get with endpoint', () => {
            const spy = spyOn(service['http'], 'get');

            service.getVirtualPlayerProfiles();

            expect(spy).toHaveBeenCalledOnceWith(service['endpoint']);
        });
    });
});
