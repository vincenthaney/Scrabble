/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Message } from '@app/classes/communication/message';
import { AbstractPlayer, Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { SYSTEM_ERROR_ID, SYSTEM_ID } from '@app/constants/game';
import { GameService, InputParserService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { marked } from 'marked';
import { CommunicationBoxComponent } from './communication-box.component';

const CURRENT_PLAYER_ID = 'idOfPlayer1';
const OPPONENT_PLAYER_ID = 'idOfPlayer2';
const DEFAULT_PLAYER1_MESSAGE: Message = {
    content: 'content of test message',
    senderId: CURRENT_PLAYER_ID,
};
const DEFAULT_PLAYER2_MESSAGE: Message = {
    content: 'content of test message',
    senderId: OPPONENT_PLAYER_ID,
};
const DEFAULT_SYSTEM_MESSAGE: Message = {
    content: 'content of test message',
    senderId: SYSTEM_ID,
};
const DEFAULT_SYSTEM_ERROR_MESSAGE: Message = {
    content: 'content of test message',
    senderId: SYSTEM_ERROR_ID,
};
const DEFAULT_SYSTEM_ERROR_VISUAL_MESSAGE: Message = {
    ...DEFAULT_SYSTEM_ERROR_MESSAGE,
    content: marked.parseInline(DEFAULT_SYSTEM_ERROR_MESSAGE.content),
};

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;

    let inputParserSpy: jasmine.SpyObj<InputParserService>;
    let virtualScrollSpy: jasmine.SpyObj<CdkVirtualScrollViewport>;
    let scrollToBottomSpy: jasmine.Spy<any>;
    let gameServiceMock: GameService;
    let formSpy: jasmine.Spy<any>;
    let initializeMessagesSpy: jasmine.Spy;

    beforeEach(async () => {
        inputParserSpy = jasmine.createSpyObj('InputParserService', ['parseInput']);
        inputParserSpy.parseInput.and.callFake(() => {
            return;
        });

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
                RouterTestingModule,
                MatTooltipModule,
            ],
            providers: [
                { provide: InputParserService, useValue: inputParserSpy },
                { provide: CdkVirtualScrollViewport, useValue: virtualScrollSpy },
                GameService,
                FocusableComponentsService,
            ],
        }).compileComponents();

        gameServiceMock = TestBed.inject(GameService);
        gameServiceMock['playerContainer'] = new PlayerContainer(CURRENT_PLAYER_ID);
        gameServiceMock['playerContainer']['players'].set(1, new Player(CURRENT_PLAYER_ID, 'player1', []));
        gameServiceMock['playerContainer']['players'].set(2, new Player(OPPONENT_PLAYER_ID, 'player2', []));
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        scrollToBottomSpy = spyOn<any>(component, 'scrollToBottom').and.callThrough();
        formSpy = spyOn(component.messageForm, 'reset');
        initializeMessagesSpy = spyOn(component['messageStorageService'], 'initializeMessages');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initializeMessage', () => {
        expect(initializeMessagesSpy).toBeTruthy();
    });

    describe('ngOnInit', () => {
        let spyMessage: jasmine.Spy;

        beforeEach(() => {
            spyMessage = spyOn(component['gameViewEventManagerService'], 'subscribeToGameViewEvent').and.callThrough();
        });

        afterEach(() => {
            spyMessage.and.callThrough();
        });

        it('should subscribe to newMessage', () => {
            component.ngOnInit();
            expect(spyMessage).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        it('should subscribe to focusable event', () => {
            const spy = spyOn<any>(component, 'subscribeToFocusableEvents');
            component.ngAfterViewInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn(component.componentDestroyed$, 'next');
            spyOn(component.componentDestroyed$, 'complete');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(component.componentDestroyed$, 'next');
            const spy = spyOn(component.componentDestroyed$, 'complete');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call messageStorageService.resetMessages', () => {
            const spy = spyOn(component['messageStorageService'], 'resetMessages');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('createVisualMessage', () => {
        it('should create visualMessage from Message by player1', () => {
            const returnValue: Message = component.createVisualMessage(DEFAULT_PLAYER1_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_PLAYER1_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });

        it('should create visualMessage from Message by player2', () => {
            const returnValue: Message = component.createVisualMessage(DEFAULT_PLAYER2_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_PLAYER2_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });

        it('should create visualMessage from Message by system', () => {
            const returnValue: Message = component.createVisualMessage(DEFAULT_SYSTEM_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_SYSTEM_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });

        it('should create visualMessage from Message by system-error', () => {
            const returnValue: Message = component.createVisualMessage(DEFAULT_SYSTEM_ERROR_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_SYSTEM_ERROR_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });
    });

    describe('onSendMessage', () => {
        it('onSendMessage should call appropriate functions if message is not empty', () => {
            component.messageForm.get('content')?.setValue('new input');
            component.onSendMessage();
            expect(inputParserSpy.parseInput).toHaveBeenCalled();
            expect(formSpy).toHaveBeenCalled();
        });

        it('onSendMessage should NOT call appropriate functions if message is empty', () => {
            component.messageForm.setValue({ content: '' });
            component.onSendMessage();
            expect(inputParserSpy.parseInput).not.toHaveBeenCalled();
            expect(formSpy).not.toHaveBeenCalled();
        });
    });

    describe('onReceiveMessage', () => {
        beforeEach(() => {
            spyOn(gameServiceMock['roundManager'], 'getActivePlayer').and.returnValue({ id: CURRENT_PLAYER_ID } as AbstractPlayer);
        });

        it('should subscribe to inputParserService and call onReceiveNewMessage', () => {
            const onReceiveSpy = spyOn(component, 'onReceiveNewMessage');
            gameServiceMock.handleNewMessage(DEFAULT_SYSTEM_MESSAGE);
            expect(onReceiveSpy).toHaveBeenCalled();
        });

        it('onReceiveNewMessage should call appropriate functions and receive new message with defined message', () => {
            const saveMessageSpy = spyOn(component['messageStorageService'], 'saveMessage');
            const messagesLengthBefore: number = component.messages.length;

            gameServiceMock.handleNewMessage(DEFAULT_SYSTEM_MESSAGE);

            const messagesLengthAfter: number = component.messages.length;
            expect(messagesLengthAfter).toEqual(messagesLengthBefore + 1);
            expect(scrollToBottomSpy).toHaveBeenCalled();
            expect(saveMessageSpy).toHaveBeenCalled();
        });

        it('should add new visualmessage to messages', () => {
            component.messages = [];
            spyOn(component, 'createVisualMessage').and.returnValue(DEFAULT_SYSTEM_ERROR_VISUAL_MESSAGE);
            component.onReceiveNewMessage(DEFAULT_SYSTEM_ERROR_MESSAGE);
            expect(component.messages).toEqual([DEFAULT_SYSTEM_ERROR_VISUAL_MESSAGE]);
        });

        it('should set loading to false if new message is NOT from opponent', () => {
            component.loading = true;
            component.onReceiveNewMessage(DEFAULT_SYSTEM_MESSAGE);
            expect(component.loading).toBeFalse();
        });

        it('should NOT set loading to true if new message is from opponent', () => {
            component.loading = true;
            component.onReceiveNewMessage(DEFAULT_PLAYER2_MESSAGE);
            expect(component.loading).toBeTrue();
        });
    });

    describe('onContainerClick', () => {
        it('should call setActiveKeyboardComponent', () => {
            const spy = spyOn(component['focusableComponentsService'], 'setActiveKeyboardComponent');
            component.onContainerClick();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onFocusableEvent', () => {
        let focusSpy: jasmine.Spy;

        beforeEach(() => {
            focusSpy = spyOn(component.messageInputElement.nativeElement, 'focus');
        });

        it('should call focus', () => {
            const event = new KeyboardEvent('keypress');
            component['onFocusableEvent'](event);
            expect(focusSpy).toHaveBeenCalled();
        });

        it('should not call focus with CTR+C or CMD+C', () => {
            const keys = ['ctrlKey', 'metaKey'];

            for (const key of keys) {
                const event: any = { key: 'c' };
                event[key] = true;
                component['onFocusableEvent'](event as KeyboardEvent);
                expect(focusSpy).not.toHaveBeenCalled();
            }
        });
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
});
