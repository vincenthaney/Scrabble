import Player from '@app/classes/player/player';
import { WordFindingRequest } from '@app/classes/word-finding';

export default class VirtualPlayer extends Player {

    constructor(){
        // subscribe
    }

    decideAction(){};

    sendPayload(){};

    generateExchangeAction(){;}

    generatePassAction(){};

    generatePlaceAction(){};

    generateWordRequest(): WordFindingRequest {

    }
    
    findRange(){};

}
