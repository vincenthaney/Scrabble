import { ActionData, ActionType } from '@app/classes/communication/action-data';
// import { expect } from 'chai';
import { VirtualPlayerService } from './virtual-player.service';
// import fetch from 'node-fetch';

describe.only('sendAction should', () => {
    let virtualPlayerService: VirtualPlayerService;
    beforeEach(() => {
        virtualPlayerService = new VirtualPlayerService();
    });

    it('should call fetch', () => {
        const TEST_GAME_ID = 'coocookachoo';
        const TEST_PLAYER_ID = 'I am the walrus';
        const TEST_ACTION: ActionData = { type: ActionType.PLACE, input: '', payload: {} };
        virtualPlayerService.sendAction(TEST_GAME_ID, TEST_PLAYER_ID, TEST_ACTION);
        // expect(stub).to.have.been.called();
    });
});
