/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerProfile } from '@app/classes/admin/virtual-player-profile';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { VirtualPlayerProfilesController } from './virtual-player-profiles.controller';

fdescribe('GameHistoryControllerService', () => {
    let controller: VirtualPlayerProfilesController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        controller = TestBed.inject(VirtualPlayerProfilesController);
    });

    it('should be created', () => {
        expect(controller).toBeTruthy();
    });

    describe('getAllVirtualPlayerProfiles', () => {
        it('should call get with right endpoint', () => {
            const spy = spyOn(controller['http'], 'get');

            controller.getAllVirtualPlayerProfiles();

            expect(spy).toHaveBeenCalledOnceWith(controller['endpoint']);
        });
    });

    describe('getVirtualPlayerProfilesFromLevel', () => {
        it('should call get with right endpoint', () => {
            const spy = spyOn(controller['http'], 'get');
            const level: VirtualPlayerLevel = VirtualPlayerLevel.Beginner;

            controller.getVirtualPlayerProfilesFromLevel(level);

            expect(spy).toHaveBeenCalledOnceWith(`${controller['endpoint']}/${level}`);
        });
    });

    describe('createVirtualPlayerProfile', () => {
        it('should call post with right endpoint', () => {
            const spy = spyOn(controller['http'], 'post');
            const profile: VirtualPlayerProfile = {
                name: 'Brun',
                level: VirtualPlayerLevel.Beginner,
                isDefault: true,
            };

            controller.createVirtualPlayerProfile(profile);

            expect(spy).toHaveBeenCalledOnceWith(controller['endpoint'], { virtualPlayerProfile: profile });
        });
    });

    describe('updateVirtualPlayerProfile', () => {
        it('should call patch with right endpoint', () => {
            const spy = spyOn(controller['http'], 'patch');
            const profilId = 'un id';
            const newName = 'mathiloulilou';

            controller.updateVirtualPlayerProfile(profilId, newName);

            expect(spy).toHaveBeenCalledOnceWith(`${controller['endpoint']}/${profilId}`, { newName });
        });
    });

    describe('deleteVirtualPlayerProfile', () => {
        it('should call delete with right endpoint', () => {
            const spy = spyOn(controller['http'], 'delete');
            const profilId = 'un id';

            controller.deleteVirtualPlayerProfile(profilId);

            expect(spy).toHaveBeenCalledOnceWith(`${controller['endpoint']}/${profilId}`);
        });
    });

    describe('resetVirtualPlayerProfiles', () => {
        it('should call delete with right endpoint', () => {
            const spy = spyOn(controller['http'], 'delete');

            controller.resetVirtualPlayerProfiles();

            expect(spy).toHaveBeenCalledOnceWith(controller['endpoint']);
        });
    });
});
