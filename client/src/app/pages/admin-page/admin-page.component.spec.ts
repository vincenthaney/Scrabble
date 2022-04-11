/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminDictionariesComponent } from '@app/components/admin-dictionaries-component/admin-dictionaries.component';
import { AdminGameHistoryComponent } from '@app/components/admin-game-history/admin-game-history.component';
import { AdminHighScoresComponent } from '@app/components/admin-high-scores/admin-high-scores.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import HighScoresService from '@app/services/high-scores-service/high-scores.service';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let highScoreServiceSpy: jasmine.SpyObj<HighScoresService>;

    beforeEach(async () => {
        highScoreServiceSpy = jasmine.createSpyObj('HighScoreService', ['handleHighScoresRequest', 'subscribeToInitializedHighScoresListEvent']);
        highScoreServiceSpy['handleHighScoresRequest'].and.callFake(() => {
            return;
        });
        highScoreServiceSpy['subscribeToInitializedHighScoresListEvent'].and.callFake(() => {
            return;
        });

        await TestBed.configureTestingModule({
            declarations: [
                AdminPageComponent,
                IconComponent,
                PageHeaderComponent,
                AdminHighScoresComponent,
                AdminDictionariesComponent,
                AdminGameHistoryComponent,
            ],
            imports: [
                MatTabsModule,
                MatCardModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([{ path: 'admin', component: AdminPageComponent }]),
                HttpClientTestingModule,
                MatSnackBarModule,
                MatDialogModule,
            ],
            providers: [{ provide: HighScoresService, useValue: highScoreServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
