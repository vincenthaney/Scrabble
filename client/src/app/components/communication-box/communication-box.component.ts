import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent {
    @ViewChild(CdkVirtualScrollViewport, { static: false }) scrollViewport: CdkVirtualScrollViewport;

    message: string;
    messages: string[] = [
        'message 1',
        'message 2',
        'message 3',
        'message 4',
        'message 5',
        'message 6',
        'message 7',
        'message 8',
        "je suis un message très long qui va sûrement prendre plus qu'une ligne à afficher parce qu'il faut tester le wrap sur plusieurs lignes",
    ];

    objectives: string[] = ['Objectif 1', 'Objectif 2', 'Objectif 3', 'Objectif 4'];

    lettersLeft: string[] = ['A : 2 ', 'B : 1 ', 'C : 2 ', 'D : 0 ', 'E : 4 '];

    messageForm = new FormGroup({
        content: new FormControl(''),
    });

    sendMessage() {
        if (this.message) {
            this.messages = [...this.messages, this.message];
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
