import { TestBed } from '@angular/core/testing';

import { InputControllerService } from './input-controller.service';

describe('InputControllerService', () => {
    let service: InputControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InputControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
