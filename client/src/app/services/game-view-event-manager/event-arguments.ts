import { GameUpdateData } from '@app/classes/communication';

export type UpdateTileReserveEventArgs = Required<Pick<GameUpdateData, 'tileReserve' | 'tileReserveTotal'>>;
