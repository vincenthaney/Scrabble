/* eslint-disable max-lines */
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
import { PlayerData } from '@app/classes/communication';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { AbstractPlayer, Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { SYSTEM_ERROR_ID, SYSTEM_ID } from '@app/constants/game';
import { GameService, InputParserService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components-service/focusable-components.service';
import { marked } from 'marked';
import { CommunicationBoxComponent } from './communication-box.component';

const DEFAULT_GAME_ID = 'game id';
const CURRENT_PLAYER_ID = 'idOfPlayer1';
const OPPONENT_PLAYER_ID = 'idOfPlayer2';
const DEFAULT_PLAYER1_MESSAGE: Message = {
    content: 'content of test message',
    senderId: CURRENT_PLAYER_ID,
    gameId: DEFAULT_GAME_ID,
};
const DEFAULT_PLAYER2_MESSAGE: Message = {
    content: 'content of test message',
    senderId: OPPONENT_PLAYER_ID,
    gameId: DEFAULT_GAME_ID,
};
const DEFAULT_SYSTEM_MESSAGE: Message = {
    content: 'content of test message',
    senderId: SYSTEM_ID,
    gameId: DEFAULT_GAME_ID,
};
const DEFAULT_SYSTEM_ERROR_MESSAGE: Message = {
    content: 'content of test message',
    senderId: SYSTEM_ERROR_ID,
    gameId: DEFAULT_GAME_ID,
};
const DEFAULT_SYSTEM_ERROR_VISUAL_MESSAGE: Message = {
    ...DEFAULT_SYSTEM_ERROR_MESSAGE,
    content: marked.parseInline(DEFAULT_SYSTEM_ERROR_MESSAGE.content),
    gameId: DEFAULT_GAME_ID,
};

const DEFAULT_START_GAME_DATA: InitializeGameData = {
    localPlayerId: CURRENT_PLAYER_ID,
    startGameData: {
        player1: undefined as unknown as PlayerData,
        player2: undefined as unknown as PlayerData,
        gameType: GameType.Classic,
        gameMode: GameMode.Multiplayer,
        maxRoundTime: 0,
        dictionary: TEST_DICTIONARY,
        gameId: DEFAULT_GAME_ID,
        board: [[]],
        tileReserve: [],
        round: {
            playerData: { id: CURRENT_PLAYER_ID },
            startTime: undefined as unknown as Date,
            limitTime: undefined as unknown as Date,
            completedTime: null,
        },
    },
};

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;

    let inputParserSpy: jasmine.SpyObj<InputParserService>;
    let virtualScrollSpy: jasmine.SpyObj<CdkVirtualScrollViewport>;
    let scrollToBottomSpy: jasmine.Spy<any>;
    let gameServiceMock: GameService;
    let formSpy: jasmine.Spy<any>;
    let storageInitializeMessagesSpy: jasmine.Spy;

    beforeEach(async () => {
        inputParserSpy = jasmine.createSpyObj('InputParserService', ['handleInput']);
        inputParserSpy['handleInput'].and.callFake(() => {
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
        storageInitializeMessagesSpy = spyOn(component['messageStorageService'], 'initializeMessages');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initializeMessage', () => {
        expect(storageInitializeMessagesSpy).toBeTruthy();
    });

    describe('ngOnInit', () => {
        let gameViewManagerSubscribeSpy: jasmine.Spy;

        beforeEach(() => {
            gameViewManagerSubscribeSpy = spyOn(component['gameViewEventManagerService'], 'subscribeToGameViewEvent').and.callThrough();
        });

        afterEach(() => {
            gameViewManagerSubscribeSpy.and.callThrough();
        });

        it('should subscribe to newMessage and gameInitialized', () => {
            component.ngOnInit();
            expect(gameViewManagerSubscribeSpy).toHaveBeenCalledTimes(2);
        });

        it('should call initializeMessages on gameInitialized event if gameData is defined', () => {
            const spy = spyOn<any>(component, 'initializeMessages');
            component.ngOnInit();
            component['gameViewEventManagerService'].emitGameViewEvent('gameInitialized', DEFAULT_START_GAME_DATA);
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call initializeMessages on gameInitialized event if gameData is undefined', () => {
            const spy = spyOn<any>(component, 'initializeMessages');
            component.ngOnInit();
            component['gameViewEventManagerService'].emitGameViewEvent('gameInitialized', undefined);
            expect(spy).not.toHaveBeenCalled();
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
            const spy = spyOn<any>(component['messageStorageService'], 'resetMessages');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('createVisualMessage', () => {
        it('should create visualMessage from Message by player1', () => {
            const returnValue: Message = component['createVisualMessage'](DEFAULT_PLAYER1_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_PLAYER1_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });

        it('should create visualMessage from Message by player2', () => {
            const returnValue: Message = component['createVisualMessage'](DEFAULT_PLAYER2_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_PLAYER2_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });

        it('should create visualMessage from Message by system', () => {
            const returnValue: Message = component['createVisualMessage'](DEFAULT_SYSTEM_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_SYSTEM_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });

        it('should create visualMessage from Message by system-error', () => {
            const returnValue: Message = component['createVisualMessage'](DEFAULT_SYSTEM_ERROR_MESSAGE);
            const expectedValue: Message = { ...DEFAULT_SYSTEM_ERROR_MESSAGE };
            expect(returnValue).toEqual(expectedValue);
        });
    });

    describe('onSendMessage', () => {
        it('onSendMessage should call appropriate functions if message is not empty', () => {
            component.messageForm.get('content')?.setValue('new input');
            component.onSendMessage();
            expect(inputParserSpy.handleInput).toHaveBeenCalled();
            expect(formSpy).toHaveBeenCalled();
        });

        it('onSendMessage should NOT call appropriate functions if message is empty', () => {
            component.messageForm.setValue({ content: '' });
            component.onSendMessage();
            expect(inputParserSpy.handleInput).not.toHaveBeenCalled();
            expect(formSpy).not.toHaveBeenCalled();
        });
    });

    describe('onReceiveMessage', () => {
        beforeEach(() => {
            spyOn(gameServiceMock['roundManager'], 'getActivePlayer').and.returnValue({ id: CURRENT_PLAYER_ID } as AbstractPlayer);
        });

        it('should subscribe to inputParserService and call onReceiveNewMessage', () => {
            const onReceiveSpy = spyOn<any>(component, 'onReceiveNewMessage');
            gameServiceMock['handleNewMessage'](DEFAULT_SYSTEM_MESSAGE);
            expect(onReceiveSpy).toHaveBeenCalled();
        });

        it('onReceiveNewMessage should call appropriate functions and receive new message with defined message', () => {
            const saveMessageSpy = spyOn(component['messageStorageService'], 'saveMessage');
            const messagesLengthBefore: number = component.messages.length;

            gameServiceMock['handleNewMessage'](DEFAULT_SYSTEM_MESSAGE);

            const messagesLengthAfter: number = component.messages.length;
            expect(messagesLengthAfter).toEqual(messagesLengthBefore + 1);
            expect(scrollToBottomSpy).toHaveBeenCalled();
            expect(saveMessageSpy).toHaveBeenCalled();
        });

        it('should add new visualmessage to messages', () => {
            component.messages = [];
            spyOn<any>(component, 'createVisualMessage').and.returnValue(DEFAULT_SYSTEM_ERROR_VISUAL_MESSAGE);
            component['onReceiveNewMessage'](DEFAULT_SYSTEM_ERROR_MESSAGE);
            expect(component.messages).toEqual([DEFAULT_SYSTEM_ERROR_VISUAL_MESSAGE]);
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

    describe('initializeMessages', () => {
        const storedMessages = [DEFAULT_PLAYER1_MESSAGE, { ...DEFAULT_PLAYER1_MESSAGE, gameId: 'other game id' }, DEFAULT_PLAYER1_MESSAGE];
        let getMessagesSpy: jasmine.Spy;

        beforeEach(() => {
            getMessagesSpy = spyOn<any>(component['messageStorageService'], 'getMessages').and.returnValue([]);
            spyOn(component['gameService'], 'getGameId').and.returnValue(DEFAULT_GAME_ID);
        });

        it('should call messageStorageService.getMessages', () => {
            component['initializeMessages'](DEFAULT_START_GAME_DATA);
            expect(getMessagesSpy).toHaveBeenCalled();
        });

        it('should add stored messages with same gameid to messages if messageStorage has messages and there are no local messages', () => {
            component['messages'] = [];
            getMessagesSpy.and.returnValue(storedMessages);

            component['initializeMessages'](DEFAULT_START_GAME_DATA);
            expect(component.messages.length).toEqual(storedMessages.length - 1);
        });

        it('should NOT add stored messages with same gameid to messages if messageStorage has messages and there are local messages', () => {
            const initialMessages = [DEFAULT_SYSTEM_MESSAGE];
            component['messages'] = initialMessages;
            getMessagesSpy.and.returnValue(storedMessages);

            component['initializeMessages'](DEFAULT_START_GAME_DATA);
            expect(component.messages.length).toEqual(initialMessages.length);
        });

        it('should add INITIAL_MESSAGE to messages if there are no local messages', () => {
            const spy = spyOn<any>(component, 'onReceiveNewMessage');

            component['initializeMessages'](DEFAULT_START_GAME_DATA);
            expect(spy).toHaveBeenCalledWith({ ...INITIAL_MESSAGE, gameId: DEFAULT_GAME_ID });
        });
    });

    describe('scrollToBottom', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('scrollToBottom should call scrollTo on viewport', async () => {
            const spy = spyOn(component.scrollViewport, 'scrollTo');
            scrollToBottomSpy.call(component, {});
            expect(scrollToBottomSpy).toHaveBeenCalled();
            Promise.resolve().then(() => {
                jasmine.clock().tick(1);
                expect(spy).toHaveBeenCalled();
            });
        });
    });
});
