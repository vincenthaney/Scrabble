import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LetterValue } from '@app/classes/tile';

type Message = { text: string; sender: string; date: Date; class: string };
type LetterMapItem = { letter: LetterValue; amount: number };

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent {
    @ViewChild(CdkVirtualScrollViewport, { static: false }) scrollViewport: CdkVirtualScrollViewport;

    message: string;
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
    // message: string;
    // messages: string[] = [
    //     'message 1',
    //     'message 2',
    //     'message 3',
    //     'message 4',
    //     'message 5',
    //     'message 6',
    //     'message 7',
    //     'message 8',
    //     "je suis un message très long qui va sûrement prendre plus qu'une ligne à afficher parce qu'il faut tester le wrap sur plusieurs lignes",
    // ];

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

    messageForm = new FormGroup({
        content: new FormControl(''),
    });

    sendMessage() {
        if (this.message) {
            this.messages = [...this.messages, { text: this.message, sender: 'Mathilde', date: new Date(), class: 'me' }];
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
