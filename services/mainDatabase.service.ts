import { UserDb } from '../database/user.db';

export class MainDatabaseService {
    userDb: UserDb;

    constructor() {
        this.userDb = new UserDb();
    }

    async syncAllTables() {
        await this.userDb.createUserTable();
    }
}
