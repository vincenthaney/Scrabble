import { VirtualPlayerProfilesRequest } from '@app/classes/communication/request';
import { VirtualPlayerProfile } from '@app/classes/database/virtual-player-profile';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { MISSING_PARAMETER, MUST_SPECIFY_LEVEL } from '@app/constants/services-errors';
import VirtualPlayerProfileService from '@app/services/virtual-player-profiles-service/virtual-player-profiles.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class VirtualPlayerProfilesController {
    router: Router;

    constructor(private virtualPlayerProfileService: VirtualPlayerProfileService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/virtualPlayerProfiles', async (req: VirtualPlayerProfilesRequest, res: Response) => {
            try {
                const virtualPlayerProfiles: VirtualPlayerProfile[] = await this.virtualPlayerProfileService.getAllVirtualPlayerProfiles();
                res.status(StatusCodes.OK).send({ virtualPlayerProfiles });
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.get('/virtualPlayerProfiles/:level', async (req: VirtualPlayerProfilesRequest, res: Response) => {
            try {
                const level: VirtualPlayerLevel | undefined = req.params.level as VirtualPlayerLevel;
                if (!level || !Object.values(VirtualPlayerLevel).includes(level))
                    throw new HttpException(MUST_SPECIFY_LEVEL, StatusCodes.BAD_REQUEST);

                const virtualPlayerProfiles: VirtualPlayerProfile[] = await this.virtualPlayerProfileService.getVirtualPlayerProfilesFromLevel(level);
                res.status(StatusCodes.OK).send({ virtualPlayerProfiles });
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/virtualPlayerProfiles', async (req: VirtualPlayerProfilesRequest, res: Response) => {
            try {
                const virtualPlayerProfile: VirtualPlayerProfile = req.body.virtualPlayerProfile;
                if (!virtualPlayerProfile) throw new HttpException(MISSING_PARAMETER, StatusCodes.BAD_REQUEST);

                await this.virtualPlayerProfileService.addVirtualPlayerProfile(virtualPlayerProfile);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.patch('/virtualPlayerProfiles/:profileId', async (req: VirtualPlayerProfilesRequest, res: Response) => {
            try {
                const profileId: string = req.params.profileId;
                const newName: string = req.body.newName;
                if (!newName) throw new HttpException(MISSING_PARAMETER, StatusCodes.BAD_REQUEST);

                await this.virtualPlayerProfileService.updateVirtualPlayerProfile(newName, profileId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/virtualPlayerProfiles', async (req: VirtualPlayerProfilesRequest, res: Response) => {
            try {
                await this.virtualPlayerProfileService.resetVirtualPlayerProfiles();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });
    }
}
