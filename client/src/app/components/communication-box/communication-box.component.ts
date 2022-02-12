import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '@app/classes/communication/message';
import { VisualMessage, VisualMessageClasses } from '@app/classes/communication/visual-message';
import { LetterValue } from '@app/classes/tile';
import { MAX_INPUT_LENGTH } from '@app/constants/game';
import { GameService, InputParserService } from '@app/services';

type LetterMapItem = { letter: LetterValue; amount: number };

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss', './communication-box-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent implements OnInit {
    @ViewChild('virtualScroll', { static: false }) scrollViewport: CdkVirtualScrollViewport;

    messages: VisualMessage[] = [];
    messageForm = new FormGroup({
        content: new FormControl('', [Validators.maxLength(MAX_INPUT_LENGTH), Validators.minLength(1)]),
    });

    // objectives: string[] = ['Objectif 1', 'Objectif 2', 'Objectif 3', 'Objectif 4'];

    lettersLeft: LetterMapItem[] = [];

    constructor(private inputParser: InputParserService, private gameService: GameService, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit() {
        this.gameService.newMessageValue.subscribe((newMessage) => {
            this.onReceiveNewMessage(newMessage);
        });
    }

    createVisualMessage(newMessage: Message): VisualMessage {
        let messageClass: VisualMessageClasses;
        if (newMessage.senderId === this.gameService.getLocalPlayerId()) {
            messageClass = VisualMessageClasses.Me;
        } else if (newMessage.senderId === VisualMessageClasses.System) {
            messageClass = VisualMessageClasses.System;
        } else {
            messageClass = VisualMessageClasses.Opponent;
        }
        return { ...newMessage, class: messageClass };
    }

    onSendMessage() {
        const message = this.messageForm.get('content')?.value;
        if (message && message.length > 0) {
            this.inputParser.parseInput(message);
            this.messageForm.reset({ content: '' });
        }
    }

    onReceiveNewMessage(newMessage: Message) {
        this.messages = [...this.messages, this.createVisualMessage(newMessage)];
        this.changeDetectorRef.detectChanges();
        this.scrollToBottom();
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
