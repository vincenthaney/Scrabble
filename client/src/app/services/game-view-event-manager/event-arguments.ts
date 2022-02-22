import { GameUpdateData } from '@app/classes/communication';

export type ValidSubjectType = void | string;

export type UpdateTileReserveEventArgs = Required<Pick<GameUpdateData, 'tileReserve' | 'tileReserveTotal'>>;
