import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent {
    message: string;
    messages: Array<string> = ["message 1", "message 2", "message 3", "message 4", "message 5", "message 6", "message 7", "message 8"]

    objectives: Array<string> = ["Objectif 1", "Objectif 2", "Objectif 3", "Objectif 4"];
    
    lettersLeft: Array<string> = [
        'A : 2 ',
        'B : 1 ',
        'C : 2 ',
        'D : 0 ',
        'E : 4 ',
    ]
    
    messageForm = new FormGroup({
        content: new FormControl(''),
    })

    sendMessage() {
        if (this.message) {
            this.messages = [...this.messages, this.message]
            console.log("sent!! - " + this.message);
            this.messageForm.reset();
            console.log(this.messages);
        }
    }
}
