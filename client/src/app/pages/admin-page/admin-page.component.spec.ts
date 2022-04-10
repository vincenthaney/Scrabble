/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminDictionariesComponent } from '@app/components/admin-dictionaries-component/admin-dictionaries.component';
import { AdminGameHistoryComponent } from '@app/components/admin-game-history/admin-game-history.component';
import { AdminHighScoresComponent } from '@app/components/admin-high-scores/admin-high-scores.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import HighScoresService from '@app/services/high-scores-service/high-scores.service';
import { Subject } from 'rxjs';
import { AdminPageComponent, DEFAULT_ADMIN_TAB } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(async () => {
        const highScoreService = jasmine.createSpyObj(HighScoresService, ['handleHighScoresRequest', 'subscribeToInitializedHighScoresListEvent']);

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
            ],
            providers: [{ provide: HighScoresService, useValue: highScoreService }],
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

    describe('ngOnInit', () => {
        let subject: Subject<Params>;

        beforeEach(() => {
            subject = new Subject<Params>();
            component['route'].queryParams = subject;
        });

        it('should set selectedTab if tab passed in params', (done) => {
            const expected = 1;

            component.ngOnInit();

            subject.next({ tab: expected });

            setTimeout(() => {
                expect(component.selectedTab).toEqual(expected);
                done();
            });
        });

        it('should not set selectedTab if tab not passed in params', (done) => {
            component.ngOnInit();

            subject.next({});

            setTimeout(() => {
                expect(component.selectedTab).toEqual(DEFAULT_ADMIN_TAB);
                done();
            });
        });

        it('should not set selectedTab if tab is not a number', (done) => {
            component.ngOnInit();

            subject.next({ tab: 'a' });

            setTimeout(() => {
                expect(component.selectedTab).toEqual(DEFAULT_ADMIN_TAB);
                done();
            });
        });
    });

    describe('selectedTabChange', () => {
        it('should call navigate', () => {
            const spy = spyOn(component['router'], 'navigate');

            component.selectedTabChange({ index: 0 } as MatTabChangeEvent);

            expect(spy).toHaveBeenCalledOnceWith([], jasmine.any(Object));
        });
    });
});
