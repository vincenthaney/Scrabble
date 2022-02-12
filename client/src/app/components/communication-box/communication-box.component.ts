import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '@app/classes/communication/message';
import { LetterValue } from '@app/classes/tile';
import { VisualMessage, VisualMessageClass } from '@app/components/communication-box/visual-message';
import { MAX_INPUT_LENGTH } from '@app/constants/game';
import { GameService, InputParserService } from '@app/services';

type LetterMapItem = { letter: LetterValue; amount: number };

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss', './communication-box-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent implements OnInit, OnDestroy {
    @ViewChild('virtualScroll', { static: false }) scrollViewport: CdkVirtualScrollViewport;

    messages: VisualMessage[] = [];
    messageForm = new FormGroup({
        content: new FormControl('', [Validators.maxLength(MAX_INPUT_LENGTH), Validators.minLength(1)]),
    });

    // objectives: string[] = ['Objectif 1', 'Objectif 2', 'Objectif 3', 'Objectif 4'];

    lettersLeftTotal: number = 0;
    lettersLeft: LetterMapItem[] = [];

    constructor(private inputParser: InputParserService, private gameService: GameService, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.lettersLeft = this.gameService.tileReserve;
        this.lettersLeftTotal = this.gameService.tileReserveTotal;

        this.gameService.updateTileReserveEvent.subscribe(({ tileReserve, tileReserveTotal }) => {
            this.onTileReserveUpdate(tileReserve, tileReserveTotal);
        });
        this.gameService.newMessageValue.subscribe((newMessage) => {
            this.onReceiveNewMessage(newMessage);
        });
    }

    ngOnDestroy(): void {
        this.gameService.updateTileReserveEvent.unsubscribe();
    }

    createVisualMessage(newMessage: Message): VisualMessage {
        let messageClass: VisualMessageClass;
        if (newMessage.senderId === this.gameService.getLocalPlayerId()) {
            messageClass = 'me';
        } else if (newMessage.senderId === 'system') {
            messageClass = 'system';
        } else {
            messageClass = 'opponent';
        }
        return { ...newMessage, class: messageClass };
    }

    onSendMessage(): void {
        const message = this.messageForm.get('content')?.value;
        if (message && message.length > 0) {
            this.inputParser.parseInput(message);
            this.messageForm.reset({ content: '' });
        }
    }

    onReceiveNewMessage(newMessage: Message): void {
        this.messages = [...this.messages, this.createVisualMessage(newMessage)];
        this.changeDetectorRef.detectChanges();
        this.scrollToBottom();
    }

    onTileReserveUpdate(tileReserve: LetterMapItem[], tileReserveTotal: number): void {
        this.lettersLeft = tileReserve;
        this.lettersLeftTotal = tileReserveTotal;
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
