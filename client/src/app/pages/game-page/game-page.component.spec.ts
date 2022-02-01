import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { BoardComponent } from '@app/components/board/board.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { InformationBoxComponent } from '@app/components/information-box/information-box.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { SurrenderDialogComponent } from '@app/components/surrender-dialog/surrender-dialog.component';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

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
            imports: [MatGridListModule],
            providers: [
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
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

    it('should open the Surrender dialog when surrender-dialog-button is clicked ', () => {
        // eslint-disable-next-line -- surrenderDialog is private and we need access for the test
        const spy = spyOn(component['surrenderDialog'], 'open');
        const surrenderButton = fixture.debugElement.nativeElement.querySelector('#surrender-dialog-button');
        surrenderButton.click();
        expect(spy).toHaveBeenCalled();
    });
});
