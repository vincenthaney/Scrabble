import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Message, MessageTypes } from '@app/classes/communication/message';
import { LetterValue } from '@app/classes/tile';
import { GameService, InputParserService } from '@app/services';

type LetterMapItem = { letter: LetterValue; amount: number };

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss', './communication-box-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent {
    @ViewChild(CdkVirtualScrollViewport, { static: false }) scrollViewport: CdkVirtualScrollViewport;

    messages: Message[] = [
        { content: 'message 1', sender: 'Mathilde', date: new Date(), type: MessageTypes.Player1 },
        { content: 'message 2', sender: 'Mathilde', date: new Date(), type: MessageTypes.Player1 },
        { content: 'message 3', sender: 'Raph', date: new Date(), type: MessageTypes.Player2 },
        { content: 'message 4', sender: 'Mathilde', date: new Date(), type: MessageTypes.Player1 },
        { content: 'Raph a joué ARBRE', sender: '', date: new Date(), type: MessageTypes.System },
        { content: 'message 5', sender: 'Raph', date: new Date(), type: MessageTypes.Player2 },
        { content: 'message 5', sender: 'Raph', date: new Date(), type: MessageTypes.Player2 },
        { content: 'message 6', sender: 'Mathilde', date: new Date(), type: MessageTypes.Player1 },
        {
            // eslint-disable-next-line max-len
            content:
                "je suis un message très long qui va sûrement prendre plus qu'une ligne \
                à afficher parce qu'il faut tester le wrap sur plusieurs lignes",
            sender: 'Raph',
            date: new Date(),
            type: MessageTypes.Player2,
        },
    ];
    messageForm = new FormGroup({
        content: new FormControl(''),
    });

    objectives: string[] = ['Objectif 1', 'Objectif 2', 'Objectif 3', 'Objectif 4'];

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
        this.gameService.newMessageValue.subscribe((newMessage) => this.messages.push(newMessage));
    }

    sendMessage() {
        const message = this.messageForm.get('content')?.value;
        if (message) {
            this.inputParser.parseInput(message);
            this.messages = [...this.messages, { content: message, sender: 'Mathilde', date: new Date(), type: MessageTypes.Player1 }];
            this.messageForm.reset();
            this.scrollToBottom();
        }
    }

    private scrollToBottom() {
        setTimeout(() => {
            this.scrollViewport.scrollTo({
                bottom: 0,
                behavior: 'auto',
            });
        }, 0);
    }
}
