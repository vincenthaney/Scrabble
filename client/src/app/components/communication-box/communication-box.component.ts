import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '@app/classes/communication/message';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { VisualMessage, VisualMessageClass } from '@app/components/communication-box/visual-message';
import { MAX_INPUT_LENGTH } from '@app/constants/game';
import { GameService, InputParserService } from '@app/services';
import { FocusableComponent } from '@app/services/focusable-components/focusable-component';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import { marked } from 'marked';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss', './communication-box-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('messageInput') messageInputElement: ElementRef;
    @ViewChild('textBoxContainer') textBoxContainer: ElementRef;
    @ViewChild('virtualScroll', { static: false }) scrollViewport: CdkVirtualScrollViewport;

    messages: VisualMessage[] = [];
    messageForm = new FormGroup({
        content: new FormControl('', [Validators.maxLength(MAX_INPUT_LENGTH), Validators.minLength(1)]),
    });

    loading: boolean = false;
    componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private inputParser: InputParserService,
        private gameService: GameService,
        private focusableComponentsService: FocusableComponentsService,
        private changeDetectorRef: ChangeDetectorRef,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {
        super();
        this.focusableComponentsService.setActiveKeyboardComponent(this);
    }

    ngOnInit(): void {
        this.gameViewEventManagerService.subscribeToGameViewEvent('newMessage', this.componentDestroyed$, (newMessage) => {
            this.onReceiveNewMessage(newMessage);
        });
    }

    ngAfterViewInit(): void {
        this.subscribeToFocusableEvents();
    }

    ngOnDestroy(): void {
        this.unsubscribeToFocusableEvents();
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    createVisualMessage(newMessage: Message): VisualMessage {
        let messageClass: VisualMessageClass;
        switch (newMessage.senderId) {
            case this.gameService.getLocalPlayerId():
                messageClass = 'me';
                break;
            case 'system':
                messageClass = 'system';
                break;
            case 'system-error':
                messageClass = 'system-error';
                break;
            default:
                messageClass = 'opponent';
                break;
        }

        return { ...newMessage, content: marked.parseInline(newMessage.content), class: messageClass };
    }

    onSendMessage(): void {
        const message = this.messageForm.get('content')?.value;
        if (message && message.length > 0 && !this.loading) {
            this.inputParser.parseAndSendInput(message);
            this.messageForm.reset({ content: '' });
            this.loading = true;
        }
    }

    onReceiveNewMessage(newMessage: Message): void {
        this.messages = [...this.messages, this.createVisualMessage(newMessage)];
        this.changeDetectorRef.detectChanges();
        this.scrollToBottom();
        if (!this.isOpponent(newMessage.senderId)) this.loading = false;
    }

    isOpponent(id: string): boolean {
        return id !== 'system' && id !== 'system-error' && id !== this.gameService.getLocalPlayerId();
    }

    getLettersLeft(): TileReserveData[] {
        return this.gameService.tileReserve;
    }

    getNumberOfTilesLeft(): number {
        return this.gameService.getTotalNumberOfTilesLeft();
    }

    onContainerClick(): void {
        this.focusableComponentsService.setActiveKeyboardComponent(this);
    }

    protected onFocusableEvent(event: KeyboardEvent): void {
        if (!this.isCtrlC(event)) this.messageInputElement?.nativeElement?.focus();
    }

    private isCtrlC(event: KeyboardEvent): boolean {
        return event.key === 'c' && (event.ctrlKey || event.metaKey);
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            this.scrollViewport.scrollTo({
                bottom: 0,
                behavior: 'auto',
            });
        }, 0);
    }
}
