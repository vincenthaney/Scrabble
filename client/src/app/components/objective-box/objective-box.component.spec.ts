import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectiveBoxComponent } from './objective-box.component';

describe('ObjectiveBoxComponent', () => {
    let component: ObjectiveBoxComponent;
    let fixture: ComponentFixture<ObjectiveBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ObjectiveBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectiveBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
