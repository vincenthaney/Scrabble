/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { LobbyData } from '@app/classes/communication/lobby-data';
import Player from '@app/classes/player/player';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { GameConfig } from './game-config';
import { GameType } from './game-type';
import WaitingRoom from './waiting-room';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_CONFIG: GameConfig = {
    player1: new Player('id', 'name'),
    dictionary: 'default',
    gameType: GameType.Classic,
    maxRoundTime: 60,
};

describe('Waiting Room', () => {
    let waitingRoom: WaitingRoom;

    beforeEach(() => {
        waitingRoom = new WaitingRoom(DEFAULT_CONFIG);
    });

    describe('Constructor', () => {
        it('Creating a waiting room should set the config', () => {
            expect(waitingRoom['config']).to.equal(DEFAULT_CONFIG);
        });
        it('Creating a waiting room should set joinedPlayer to undefined', () => {
            expect(waitingRoom['joinedPlayer']).to.be.undefined;
        });
    });

    it('getConfig should return the room config', () => {
        expect(waitingRoom.getConfig()).to.equal(DEFAULT_CONFIG);
    });

    it('convertToLobbyData should return the correct information', () => {
        const actualData: LobbyData = waitingRoom.convertToLobbyData();
        const expectedData: LobbyData = {
            lobbyId: waitingRoom['id'],
            hostName: waitingRoom['config'].player1.name,
            gameType: waitingRoom['config'].gameType,
            maxRoundTime: waitingRoom['config'].maxRoundTime,
            dictionary: waitingRoom['config'].dictionary,
        };

        expect(actualData).to.deep.equal(expectedData);
    });
});
