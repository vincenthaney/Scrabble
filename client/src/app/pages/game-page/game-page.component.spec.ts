import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePageComponent } from './game-page.component';
import { SurrenderDialogComponent } from '@app/components/surrender-dialog/surrender-dialog.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { InformationBoxComponent } from '@app/components/information-box/information-box.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { BoardComponent } from '@app/components/board/board.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                SurrenderDialogComponent,
                RackComponent,
                InformationBoxComponent,
                CommunicationBoxComponent,
                BoardComponent,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
