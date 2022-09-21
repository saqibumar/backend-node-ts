import { Sequelize } from "sequelize";

const ROASTER_APP_HOME = process.env.ROASTER_APP_HOME || '.';
const ROASTER_APP_DB_FILE = process.env.ROASTER_APP_DB_FILE || 'db.sqlite3';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.ROASTER_APP_DB_FILE || 'db.sqlite3',
    logging: false
  });
