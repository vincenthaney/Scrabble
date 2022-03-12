import { Injectable } from '@angular/core';
import { Message } from '@app/classes/communication/message';
import { MESSAGE_STORAGE_KEY } from '@app/constants/session-storage-constants';

@Injectable({
    providedIn: 'root',
})
export class SessionStorageService {
    constructor() {}

    // getData(dataKeyName: string): T[] {
    //     return JSON.parse(sessionStorage.getItem(dataKeyName) as string);
    // }

    // addData(datakeyName: string, newData: T) {
    //     const localData:
    // }

    getMessages(): Message[] {
        return JSON.parse(sessionStorage.getItem(MESSAGE_STORAGE_KEY) || '{}');
    }

    saveMessage(newMessage: Message): void {
        const localMessages: Message[] = this.getMessages();
        localMessages.push(newMessage);
        sessionStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(localMessages));
        console.log('new message saved : ' + newMessage.content);
    }

    resetMessages() {
        sessionStorage.clear();
    }
}
