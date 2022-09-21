import {BaseDb} from "./base.db";
import {CryptoService} from "../services/crypto.service";
import { fakeUsers } from "../services/fakeUsers";

enum Roles {
    ROASTER = 'roaster',
    MANAGER = 'manager',
}

export class UserDb extends BaseDb {
    cryptoService: CryptoService;

    constructor() {
        super();
        this.cryptoService = new CryptoService()
    }


    async createUserTable() {
        const fields = "email TEXT UNIQUE, " +
            "password TEXT, " +
            "role TEXT, " +
            "profileImg STRING DEFAULT NULL,"+
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "syncedToCognito BOOLEAN DEFAULT false, " +
            "token STRING DEFAULT NULL ";
        return await this.reCreateTable('users', fields)
    }


    async insertDefaultUsers() {
        try {
            const stmt = this._db.prepare("INSERT INTO users VALUES (?,?,?,?,NULL,true,NULL)");

            for (let user of fakeUsers) {
                let hash = await this.cryptoService.encrypt(user.password)
                stmt.run(user.email, JSON.stringify(hash), user.role, user.profileImg);
            }

        } catch (e) {

        }
    }


    async comparePasswordToHash(password, hashedPassword) {
        if (await this.cryptoService.decrypt(JSON.parse(hashedPassword)) === password) {
            return true
        }
        return false;
    }

    getUser(user) {
        return new Promise((resolve, reject) => {
            this._db.get("SELECT * FROM users WHERE email = ? ", user.username, (err, row) => {
                resolve(row)
            });
        });
    }
    
    getUsers() {
        return new Promise((resolve, reject) => {
            this._db.all('SELECT * FROM users', (err, rows) => {
                resolve(rows)
            });
        });        
    }

    async checkIfUserAndPasswordIsValid(user: { username: string, password: string }) {
        const userObj: any = await this.getUser(user)

        if (!userObj) {
            return {success: false, error: "USER_NOT_FOUND"}
        }
        const isEqual = await this.comparePasswordToHash(user.password, userObj.password)
        if (!isEqual) {
            return {success: false, error: "INVALID_PASSWORD"}
        }
        return {success: true, user: userObj}


    }

    public async getNotSyncUsers() {
        return new Promise((resolve, reject) => {
            this._db.all("SELECT * FROM users WHERE syncedToCognito = ? ", false, (err, rows) => {
                resolve(rows)
            });
        });
    }

    async setSyncUserStatus(id) {
        return this._db.run(`UPDATE users SET syncedToCognito=true WHERE id=${id}`);
    }

    public updateToken(id,token){
        return this._db.run(`UPDATE users SET token='${token}' WHERE id=${id}`)
    }
    
    async updateProfileImage(userId, localImage) {
        const now = Date.now();
        const stmt = this._db.prepare(
            `UPDATE users 
            SET profileImg = ?
            WHERE id=?`
        );
        
        return stmt.run(localImage, userId);
    }
}