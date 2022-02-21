import { TestBed } from '@angular/core/testing';

import { MenuViewEventManagerService } from './menu-view-event-manager.service';

describe('MenuViewEventManagerService', () => {
  let service: MenuViewEventManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuViewEventManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
