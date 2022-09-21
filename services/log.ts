// TRANSPORT: https://docs.logz.io/shipping/log-sources/go.html
// https://docs.logz.io/shipping/log-sources/nodejs.html

// import logzioNodejs from 'logzio-nodejs';

export default class Log {
    logger;
    additionalParams;

    private static INFO_LOG_LEVEL = 'info';
    private static DEBUG_LOG_LEVEL = 'debug';
    private static WARN_LOG_LEVEL = 'warn';
    private static ERROR_LOG_LEVEL = 'error';

    constructor(params) {
        let config = params.config;

        delete params.config;
        params.environment = config.environment || '';
        params.app = config.app_name || '';
        params.version = config.app_version;
        params.type = 'roaster';

        this.additionalParams = params;

        let options = {
            level: 'info',
            name: 'roster-app',
            token: config.logzio_token,
            host: config.logzio_host,
            protocol: config.environment === 'DEVELOPMENT' ? 'http' : 'https',
            port: config.environment === 'DEVELOPMENT' ? '8070' : '8071',
            // bufferSize:10, ??
            // addTimestampWithNanoSecs: true, ??
        };
    }

    debug(message) {
        this.log(Log.DEBUG_LOG_LEVEL, message);
    }

    info(message, print: boolean = false) {
        this.log(Log.INFO_LOG_LEVEL, message, print);
    }

    warn(message) {
        this.log(Log.WARN_LOG_LEVEL, message);
    }

    error(message, print: boolean = false) {
        this.log(Log.ERROR_LOG_LEVEL, message, print);
    }

    private getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    }

    private getString(message) {
        const messageType = typeof message;
        if (messageType === 'object') {
            if (message instanceof Error) {
                return message.message;
            }
            return JSON.stringify(message, this.getCircularReplacer());
        }
        return message;
    }

    private log(level, message, print: boolean = false) {
        try {
            const timestamp = new Date().toISOString();
            const entry: any = { timestamp, level, ...this.additionalParams };

            if (typeof message === 'string') {
                entry.message = message;
            } else {
                this.copyValue(message, entry, 'message');
                entry.payload = message;
            }

            this.copyValue(message, entry, 'machineName', 'machine');
            this.copyValue(message, entry, 'machine');

            const { app, version, type, environment, ...terminalLog } = entry;
            console.log({
                ...terminalLog,
                payload: this.getString(terminalLog.payload),
            });
        } catch (err: any) {
            console.error(`Logz.io Error: ${err.message}`);
        }
    }

    private copyValue(
        srcObj: any,
        targetObj: any,
        srcAttribute: string,
        targetAttribute?: string
    ) {
        if (srcObj[srcAttribute]) {
            if (!targetAttribute) targetAttribute = srcAttribute;

            targetObj[targetAttribute] = srcObj[srcAttribute];
            delete srcObj[srcAttribute];
        }
    }
}
