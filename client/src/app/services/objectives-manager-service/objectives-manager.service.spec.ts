import { TestBed } from '@angular/core/testing';

import { ObjectivesManagerService } from './objectives-manager.service';

describe('ObjectivesManagerService', () => {
    let service: ObjectivesManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ObjectivesManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
