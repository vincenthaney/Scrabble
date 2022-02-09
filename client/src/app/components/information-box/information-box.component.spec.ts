import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { MatCardModule } from '@angular/material/card';
import { InformationBoxComponent } from './information-box.component';
import SpyObj = jasmine.SpyObj;

describe('InformationBoxComponent', () => {
    let component: InformationBoxComponent;
    let fixture: ComponentFixture<InformationBoxComponent>;
    let roundManagerSpy: SpyObj<RoundManagerService>;
    let gameServiceSpy: SpyObj<GameService>;

    beforeEach(() => {
        roundManagerSpy = jasmine.createSpyObj('RoundManagerService', ['getActivePlayer']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatCardModule],
            declarations: [InformationBoxComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: RoundManagerService, useValue: roundManagerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
