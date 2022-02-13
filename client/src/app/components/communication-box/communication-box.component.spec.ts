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
import { Player } from '@app/classes/player';
import { VisualMessage } from '@app/components/communication-box/visual-message';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { SYSTEM_ID } from '@app/constants/game';
import { GameService, InputParserService } from '@app/services';
import { CommunicationBoxComponent, LetterMapItem } from './communication-box.component';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;

    let inputParserSpy: jasmine.SpyObj<InputParserService>;
    let virtualScrollSpy: jasmine.SpyObj<CdkVirtualScrollViewport>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scrollToBottomSpy: jasmine.Spy<any>;
    let gameServiceMock: GameService;
    let formSpy: jasmine.Spy<any>;

    const CURRENT_PLAYER_ID = 'idOfPlayer1';
    const OPPONENT_PLAYER_ID = 'idOfPlayer2';
    const testMessagePlayer1: Message = {
        content: 'content of test message',
        senderId: CURRENT_PLAYER_ID,
    };
    const testMessagePlayer2: Message = {
        content: 'content of test message',
        senderId: OPPONENT_PLAYER_ID,
    };
    const testMessageSystem: Message = {
        content: 'content of test message',
        senderId: SYSTEM_ID,
    };

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
                RouterTestingModule,
                MatTooltipModule,
            ],
            providers: [
                { provide: InputParserService, useValue: inputParserSpy },
                { provide: CdkVirtualScrollViewport, useValue: virtualScrollSpy },
                GameService,
            ],
        }).compileComponents();

        gameServiceMock = TestBed.inject(GameService);
        gameServiceMock.player1 = new Player(CURRENT_PLAYER_ID, 'player1', []);
        gameServiceMock.player2 = new Player(OPPONENT_PLAYER_ID, 'player2', []);
        gameServiceMock['localPlayerId'] = CURRENT_PLAYER_ID;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scrollToBottomSpy = spyOn<any>(component, 'scrollToBottom').and.callThrough();
        formSpy = spyOn(component.messageForm, 'reset');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to inputParserService and call onReceiveNewMessage', () => {
        const onReceiveSpy = spyOn(component, 'onReceiveNewMessage');
        gameServiceMock.handleNewMessage(testMessageSystem);
        expect(onReceiveSpy).toHaveBeenCalled();
    });

    it('onReceiveNewMessage should call appropriate functions and receive new message', () => {
        const messagesLengthBefore: number = component.messages.length;
        gameServiceMock.handleNewMessage(testMessageSystem);
        const messagesLengthAfter: number = component.messages.length;
        expect(messagesLengthAfter).toEqual(messagesLengthBefore + 1);
        expect(scrollToBottomSpy).toHaveBeenCalled();
    });

    it('should create visualMessage from Message by player1', () => {
        const returnValue: VisualMessage = component.createVisualMessage(testMessagePlayer1);
        const expectedValue: VisualMessage = { ...testMessagePlayer1, class: 'me' };
        expect(returnValue).toEqual(expectedValue);
    });

    it('should create visualMessage from Message by player2', () => {
        const returnValue: VisualMessage = component.createVisualMessage(testMessagePlayer2);
        const expectedValue: VisualMessage = { ...testMessagePlayer2, class: 'opponent' };
        expect(returnValue).toEqual(expectedValue);
    });

    it('should create visualMessage from Message by system', () => {
        const returnValue: VisualMessage = component.createVisualMessage(testMessageSystem);
        const expectedValue: VisualMessage = { ...testMessageSystem, class: 'system' };
        expect(returnValue).toEqual(expectedValue);
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

    // it('onSendMessage should clear input field', () => {
    //     const inputField = component.messageForm.get('content');
    //     inputField?.setValue('new input');
    //     console.log(component.messageForm.get('content')?.value);
    //     component.onSendMessage();
    //     console.log(component.messageForm.get('content')?.value);
    //     expect(inputField?.value).toEqual('');
    // });

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

    describe('ngOnInit', () => {
        let spyTile: jasmine.Spy;
        let spyMessage: jasmine.Spy;

        beforeEach(() => {
            spyTile = spyOn(component['gameService'].updateTileReserveEvent, 'subscribe');
            spyMessage = spyOn(component['gameService'].newMessageValue, 'subscribe');
        });

        afterEach(() => {
            spyTile.and.callThrough();
            spyMessage.and.callThrough();
        });

        it('should subscribe to updateTileReserveEvent', () => {
            component.ngOnInit();
            expect(spyTile).toHaveBeenCalled();
        });

        it('should call onTileReserveUpdate on updateTileReserveEvent', () => {
            const spy = spyOn(component, 'onTileReserveUpdate');
            component.ngOnInit();
            component['gameService'].updateTileReserveEvent.emit({ tileReserve: [], tileReserveTotal: 0 });
            expect(spy).toHaveBeenCalled();
        });

        it('should subscribe to updateTileReserveEvent', () => {
            component.ngOnInit();
            expect(spyMessage).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        it('should call focus on handleKeyEvent', () => {
            const spy = spyOn(component.messageInputElement.nativeElement, 'focus');
            component.focusEvent.emit(new KeyboardEvent('keypress'));
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onTileReserveUpdate', () => {
        it('should set lettersLeft and tileReserveTotal', () => {
            component.lettersLeft = [];
            component.lettersLeftTotal = 0;
            const expectedLettersLeft: LetterMapItem[] = [{ letter: 'A', amount: 0 }];
            const expectedLettersLeftTotal = 1;

            expect(component.lettersLeft).not.toEqual(expectedLettersLeft);
            expect(component.lettersLeftTotal).not.toEqual(expectedLettersLeftTotal);

            component.onTileReserveUpdate(expectedLettersLeft, expectedLettersLeftTotal);

            expect(component.lettersLeft).toEqual(expectedLettersLeft);
            expect(component.lettersLeftTotal).toEqual(expectedLettersLeftTotal);
        });
    });
});
