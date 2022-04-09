import { VirtualPlayerProfile, VirtualPlayerProfileData } from '@app/classes/database/virtual-player-profile';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import {
    DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH,
    HIGH_SCORES_MONGO_COLLECTION_NAME,
    VIRTUAL_PLAYER_PROFILES_MONGO_COLLECTION_NAME,
} from '@app/constants/services-constants/mongo-db.const';
import { CANNOT_ADD_DEFAULT_PROFILE, CANNOT_MODIFY_DEFAULT_PROFILE, NAME_ALREADY_USED } from '@app/constants/services-errors';
import DatabaseService from '@app/services/database-service/database.service';
import { promises } from 'fs';
import { StatusCodes } from 'http-status-codes';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Collection } from 'mongodb';
import { join } from 'path';
import { Service } from 'typedi';

@Service()
export default class VirtualPlayerProfilesService {
    constructor(private databaseService: DatabaseService) {}

    private static async fetchDefaultVirtualPlayerProfiles(): Promise<VirtualPlayerProfile[]> {
        const filePath = join(__dirname, DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultVirtualPlayerProfiles: VirtualPlayerProfileData = JSON.parse(dataBuffer);
        return defaultVirtualPlayerProfiles.virtualPlayerProfiles;
    }

    async getAllVirtualPlayerProfiles(): Promise<VirtualPlayerProfile[]> {
        return this.collection.find({}).toArray();
    }

    async getVirtualPlayerProfilesFromLevel(level: VirtualPlayerLevel): Promise<VirtualPlayerProfile[]> {
        return this.collection.find({ level }).toArray();
    }

    async addVirtualPlayerProfile(newProfile: VirtualPlayerProfile): Promise<void> {
        const isNameAlreadyUsed: boolean = (await this.getAllVirtualPlayerProfiles()).some(
            (profile: VirtualPlayerProfile) => profile.name === newProfile.name,
        );
        if (isNameAlreadyUsed) throw new HttpException(NAME_ALREADY_USED(newProfile.name), StatusCodes.BAD_REQUEST);
        if (newProfile.isDefault) throw new HttpException(CANNOT_ADD_DEFAULT_PROFILE, StatusCodes.BAD_REQUEST);

        await this.collection.insertOne(newProfile);
    }

    async updateVirtualPlayerProfile(newName: string, virtualPlayerProfile: VirtualPlayerProfile): Promise<void> {
        if (virtualPlayerProfile.isDefault) throw new HttpException(CANNOT_MODIFY_DEFAULT_PROFILE, StatusCodes.BAD_REQUEST);

        await this.collection.updateOne(
            { name: virtualPlayerProfile.name, level: virtualPlayerProfile.level, isDefault: virtualPlayerProfile.isDefault },
            { $set: { name: newName } },
        );
    }

    async deleteVirtualPlayerProfile(virtualPlayerProfile: VirtualPlayerProfile): Promise<void> {
        if (virtualPlayerProfile.isDefault) throw new HttpException(CANNOT_MODIFY_DEFAULT_PROFILE, StatusCodes.BAD_REQUEST);

        await this.collection.deleteOne({
            name: virtualPlayerProfile.name,
            level: virtualPlayerProfile.level,
            isDefault: virtualPlayerProfile.isDefault,
        });
    }

    async resetVirtualPlayerProfiles(): Promise<void> {
        await this.collection.deleteMany({});
        await this.populateDb();
    }

    private get collection(): Collection<VirtualPlayerProfile> {
        return this.databaseService.database.collection(HIGH_SCORES_MONGO_COLLECTION_NAME);
    }

    private async populateDb(): Promise<void> {
        await this.databaseService.populateDb(
            VIRTUAL_PLAYER_PROFILES_MONGO_COLLECTION_NAME,
            await VirtualPlayerProfilesService.fetchDefaultVirtualPlayerProfiles(),
        );
    }
}
