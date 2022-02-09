export enum MessageTypes {
    Player1,
    Player2,
    System,
}

export interface Message {
    content: string;
    sender: string;
    date: Date;
    type: MessageTypes;
}
