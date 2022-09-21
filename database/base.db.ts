import path from 'path';
import * as sqlite from 'sqlite3';



const ROASTER_APP_HOME = process.env.ROASTER_APP_HOME || '.';
const ROASTER_APP_DB_FILE = process.env.ROASTER_APP_DB_FILE || 'db.sqlite3';

const dbPath = path.join(ROASTER_APP_HOME, ROASTER_APP_DB_FILE);

const sqlite3 = sqlite.verbose();
let db = new sqlite3.Database(dbPath);
db.configure("busyTimeout", 1000);


export class BaseDb {

    _db = db;

    async reCreateTable(tableName, fields) {
        try {
            return new Promise((resolve, reject) => {
                this._db.run(`DROP TABLE IF EXISTS ${tableName}`, (error, result) => {
                    if(error) reject(error);
                    this._db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${fields})`, (error2, result2) => {
                        if(error2) reject(error2);
                        resolve(result2);
                    });
                });
            })
        } catch (e) {

        }

    }

    async createTableIfNotExists(tableName, fields) {
        return this._db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${fields})`);
    }


    checkIfTableExists(tableName) {
        return this._db.run("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    }

    write(sql, ...args) {
        const stmt = db.prepare(sql);
        const info = stmt.run(args);
        return info;
    }

    async getAll(tableName: string) {
        return new Promise((resolve, reject) => {
            return this._db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                resolve(rows)
            });
        });
    }

    readOne(sql, ...args) {
        const stmt = db.prepare(sql);
        return stmt.get(args);
    }

    async setSyncStatus(id,tableName: string) {
        return this._db.run(`UPDATE ${tableName} SET synced=true WHERE id=${id}`);
    }

    public async getNotSyncRecord(tableName) {
        return new Promise((resolve, reject) => {
            this._db.all(`SELECT * FROM ${tableName} WHERE synced = ? `, false, (err, rows) => {
                resolve(rows)
            });
        });
    }


}

