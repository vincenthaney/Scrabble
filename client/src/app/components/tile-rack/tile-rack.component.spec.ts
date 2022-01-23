import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileRackComponent } from './tile-rack.component';

describe('TileRackComponent', () => {
  let component: TileRackComponent;
  let fixture: ComponentFixture<TileRackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TileRackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TileRackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
