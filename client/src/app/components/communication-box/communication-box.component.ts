import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LetterValue } from '@app/classes/tile';
import { GameService, InputParserService } from '@app/services';

type Message = { text: string; sender: string; date: Date; class: string };
type LetterMapItem = { letter: LetterValue; amount: number };

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss', './communication-box-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent implements OnInit, OnDestroy {
    @ViewChild(CdkVirtualScrollViewport, { static: false }) scrollViewport: CdkVirtualScrollViewport;

    messages: Message[] = [
        { text: 'message 1', sender: 'Mathilde', date: new Date(), class: 'me' },
        { text: 'message 2', sender: 'Mathilde', date: new Date(), class: 'me' },
        { text: 'message 3', sender: 'Raph', date: new Date(), class: 'opponent' },
        { text: 'message 4', sender: 'Mathilde', date: new Date(), class: 'me' },
        { text: 'Raph a joué ARBRE', sender: '', date: new Date(), class: 'system' },
        { text: 'message 5', sender: 'Raph', date: new Date(), class: 'opponent' },
        { text: 'message 5', sender: 'Raph', date: new Date(), class: 'opponent' },
        { text: 'message 6', sender: 'Mathilde', date: new Date(), class: 'me' },
        {
            // eslint-disable-next-line max-len
            text: "je suis un message très long qui va sûrement prendre plus qu'une ligne à afficher parce qu'il faut tester le wrap sur plusieurs lignes",
            sender: 'Raph',
            date: new Date(),
            class: 'opponent',
        },
    ];
    messageForm = new FormGroup({
        content: new FormControl(''),
    });

    objectives: string[] = ['Objectif 1', 'Objectif 2', 'Objectif 3', 'Objectif 4'];

    lettersLeftTotal: number = 0;
    lettersLeft: LetterMapItem[] = [];

    constructor(private inputParser: InputParserService, private gameService: GameService) {}

    ngOnInit() {
        this.lettersLeft = this.gameService.tileReserve;
        this.lettersLeftTotal = this.gameService.tileReserveTotal;

        this.gameService.updateTileReserveEvent.subscribe(({ tileReserve, tileReserveTotal }) => {
            this.onTileReserveUpdate(tileReserve, tileReserveTotal);
        });
    }

    ngOnDestroy() {
        this.gameService.updateTileReserveEvent.unsubscribe();
    }

    sendMessage() {
        const message = this.messageForm.get('content')?.value;
        if (message) {
            this.inputParser.parseInput(message);
            this.messages = [...this.messages, { text: message, sender: 'Mathilde', date: new Date(), class: 'me' }];
            this.messageForm.reset();
            this.scrollToBottom();
        }
    }

    onTileReserveUpdate(tileReserve: LetterMapItem[], tileReserveTotal: number) {
        this.lettersLeft = tileReserve;
        this.lettersLeftTotal = tileReserveTotal;
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
