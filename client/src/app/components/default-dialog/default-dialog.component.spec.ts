import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { DefaultDialogComponent } from './default-dialog.component';
import defaultDialogErrors from './default-dialog.component.errors';
import { DefaultDialogParameters } from './default-dialog.component.types';

const createDialog = (model: DefaultDialogParameters): [component: DefaultDialogComponent, fixture: ComponentFixture<DefaultDialogComponent>] => {
    TestBed.configureTestingModule({
        declarations: [DefaultDialogComponent],
        imports: [MatButtonModule, MatDialogModule, RouterTestingModule.withRoutes([])],
        providers: [
            {
                provide: MAT_DIALOG_DATA,
                useValue: model,
            },
        ],
    }).compileComponents();

    const fixture: ComponentFixture<DefaultDialogComponent> = TestBed.createComponent(DefaultDialogComponent);
    const component: DefaultDialogComponent = fixture.componentInstance;

    fixture.detectChanges();

    return [component, fixture];
};
const createDialogWithUnknownModel = (model: unknown): [component: DefaultDialogComponent, fixture: ComponentFixture<DefaultDialogComponent>] => {
    return createDialog(model as DefaultDialogParameters);
};

describe('DefaultDialogComponent', () => {
    const model: DefaultDialogParameters = {
        title: 'Dialog title',
        content: 'Dialog content',
        buttons: [
            {
                content: 'Button 1',
                closeDialog: true,
            },
            {
                content: 'Button 2',
            },
        ],
    };
    let component: DefaultDialogComponent;
    // let fixture: ComponentFixture<DefaultDialogComponent>;

    it('should be created', async () => {
        [component] = createDialog(model);
        expect(component).toBeTruthy();
    });
});

describe('DefaultDialogComponent with constructor error', () => {
    it('should throw error when no title is provided', () => {
        const model = {
            notATitle: 'This is not a title',
        };
        expect(() => createDialogWithUnknownModel(model)).toThrowError(defaultDialogErrors.DIALOG_MUST_HAVE_TITLE);
    });

    it('should throw error when buttons is not an array', () => {
        const model = {
            title: 'Title',
            buttons: {
                content: 'Button but not in an array',
            },
        };
        expect(() => createDialogWithUnknownModel(model)).toThrowError(defaultDialogErrors.DIALOG_BUTTONS_MUST_BE_AN_ARRAY);
    });

    it('should throw error when any button has no content', () => {
        const model = {
            title: 'Title',
            buttons: [
                {
                    notAContent: 'This it not a content',
                },
            ],
        };
        expect(() => createDialogWithUnknownModel(model)).toThrowError(defaultDialogErrors.BUTTON_MUST_HAVE_CONTENT);
    });
});
