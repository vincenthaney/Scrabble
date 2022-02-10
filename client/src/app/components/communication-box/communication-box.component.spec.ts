/* eslint-disable dot-notation */
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { GameService, InputParserService } from '@app/services';
import { CommunicationBoxComponent } from './communication-box.component';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;

    let inputParserSpy: jasmine.SpyObj<InputParserService>;
    let virtualScrollSpy: jasmine.SpyObj<CdkVirtualScrollViewport>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scrollToBottomSpy: jasmine.Spy<any>;
    let gameServiceSpy: GameService;

    beforeEach(async () => {
        inputParserSpy = jasmine.createSpyObj('InputParserService', ['parseInput', 'emitNewMessage']);
        inputParserSpy.parseInput.and.callFake(() => {
            return;
        });
        inputParserSpy.emitNewMessage.and.callThrough();

        virtualScrollSpy = jasmine.createSpyObj('CdkVirtualScrollViewport', ['scrollTo']);
        virtualScrollSpy.scrollTo.and.callFake(() => {
            return;
        });

        await TestBed.configureTestingModule({
            declarations: [CommunicationBoxComponent, IconComponent, TileComponent, CdkVirtualScrollViewport],
            imports: [
                MatExpansionModule,
                MatCardModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                ScrollingModule,
                HttpClientTestingModule,
            ],
            providers: [
                { provide: InputParserService, useValue: inputParserSpy },
                { provide: CdkVirtualScrollViewport, useValue: virtualScrollSpy },
                GameService,
            ],
        }).compileComponents();

        gameServiceSpy = TestBed.inject(GameService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scrollToBottomSpy = spyOn<any>(component, 'scrollToBottom').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('scrollToBottom should call scrollTo on viewport', async () => {
        jasmine.clock().install();
        const spy = spyOn(component.scrollViewport, 'scrollTo');
        scrollToBottomSpy.call(component, {});
        expect(scrollToBottomSpy).toHaveBeenCalled();
        Promise.resolve().then(() => {
            jasmine.clock().tick(1);
            expect(spy).toHaveBeenCalled();
        });
    });

    it('onSendMessage should clear input field', () => {
        const inputField = component.messageForm.get('content');
        inputField?.setValue('new input');
        component.onSendMessage();
        expect(inputField?.value).toEqual(null);
    });

    it('onSendMessage should call appropriate functions if message is not empty', () => {
        component.messageForm.setValue({ content: 'new input' });
        component.onSendMessage();
        expect(inputParserSpy.parseInput).toHaveBeenCalled();
        expect(scrollToBottomSpy).toHaveBeenCalled();
    });

    it('onSendMessage should NOT call appropriate functions if message is empty', () => {
        component.messageForm.setValue({ content: '' });
        component.onSendMessage();
        expect(inputParserSpy.parseInput).not.toHaveBeenCalled();
        expect(scrollToBottomSpy).not.toHaveBeenCalled();
    });

    it('should subscribe to inputParserService and receive its new messages', () => {
        const messagesLengthBefore: number = component.messages.length;
        gameServiceSpy.handleNewMessage({
            content: 'new message',
            senderId: 'System',
            date: new Date(),
        });
        const messagesLengthAfter: number = component.messages.length;
        expect(messagesLengthAfter).toEqual(messagesLengthBefore + 1);
    });
});
