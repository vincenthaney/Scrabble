import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '@app/classes/communication/message';
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
export class CommunicationBoxComponent {
    @ViewChild('virtualScroll', { static: false }) scrollViewport: CdkVirtualScrollViewport;

    messages: Message[] = [
        { content: 'message 1', senderId: 'Mathilde', date: new Date() },
        { content: 'message 2', senderId: 'Mathilde', date: new Date() },
        { content: 'message 3', senderId: 'Raph', date: new Date() },
        { content: 'message 4', senderId: 'Mathilde', date: new Date() },
        { content: 'Raph a joué ARBRE', senderId: '', date: new Date() },
        { content: 'message 5', senderId: 'Raph', date: new Date() },
        { content: 'message 5', senderId: 'Raph', date: new Date() },
        { content: 'message 6', senderId: 'Mathilde', date: new Date() },
        {
            // eslint-disable-next-line max-len
            content:
                "je suis un message très long qui va sûrement prendre plus qu'une ligne \
                à afficher parce qu'il faut tester le wrap sur plusieurs lignes",
            senderId: 'Raph',
            date: new Date(),
        },
    ];
    messageForm = new FormGroup({
        content: new FormControl('', [Validators.maxLength(MAX_INPUT_LENGTH), Validators.minLength(1)]),
    });

    // objectives: string[] = ['Objectif 1', 'Objectif 2', 'Objectif 3', 'Objectif 4'];

    lettersLeft: LetterMapItem[] = [
        { letter: 'A', amount: 4 },
        { letter: 'B', amount: 7 },
        { letter: 'C', amount: 2 },
        { letter: 'D', amount: 5 },
        { letter: 'E', amount: 8 },
        { letter: 'F', amount: 2 },
        { letter: 'G', amount: 5 },
        { letter: 'H', amount: 8 },
        { letter: 'I', amount: 2 },
        { letter: 'K', amount: 8 },
        { letter: 'L', amount: 2 },
        { letter: 'M', amount: 5 },
        { letter: 'N', amount: 8 },
        { letter: 'O', amount: 2 },
    ];

    constructor(private inputParser: InputParserService, private gameService: GameService) {
        this.gameService.newMessageValue.subscribe((newMessage) => {
            this.messages.push(newMessage);
        });
    }

    onSendMessage() {
        const message = this.messageForm.get('content')?.value;
        if (message && message.length > 0) {
            this.inputParser.parseInput(message);
            this.messageForm.reset();
            this.scrollToBottom();
        }
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
