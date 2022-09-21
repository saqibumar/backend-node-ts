import { SocketRestServ } from './services/socketRestServ';
// import express from 'express'
import { LoginRoute } from './routes/loginRoute';
import { config } from './config';
import './init-roaster';
import Log from "./services/log";

// const app = express()
const PORT = 3000

const srv = new SocketRestServ([
    ...config.CORSorigins,
    config.clientUrl + ':' + config.clientPort,
]);
new LoginRoute('', srv.app);

const logger = new Log({config: config, className: 'srv'})

srv.listen(config.serverPort);
logger.info(`The server is running on port ${config.serverPort}`);

// app.get('/', (req, res) => res.json({message: 'Works'}))

// app.listen(PORT, () => console.log(`Listening to http://localhost:${PORT}`))

const exitHandler = (code: number, message: string, error?: Error): void => {
    message = `Application terminated. Reason: ${message}`;
    const stack = error ? error.stack : null;
    console.error(JSON.stringify({message, stack}))

    logger.error({
        message,
        stack,
    });

    process.exit(code);
}

process.on('uncaughtException', (e: Error) => exitHandler(1, 'Unexpected Error', e));
process.on('unhandledRejection', (e: Error) => exitHandler(1, 'Unhandled Promise', e));
process.on('SIGTERM', () => exitHandler(0, 'SIGTERM'));
process.on('SIGINT', () => exitHandler(0, 'SIGINT'));

(async () => {
    // await new MainDatabaseService().syncAllTables()
})();