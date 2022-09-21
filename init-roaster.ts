import Logger from './services/log';
import { config } from './config';

const logger = new Logger({ config, source: __filename });

let timeoutID: any;
let retryCounter = 0;

const initRoaster = async () => {
    logger.info('Initializing Roaster...');
    let successful = true;
    try {
        if (config.BWC_VUE) {
            // successful = await enableBeanConfirmation();
        }

        if (successful) {
            clearTimeout(timeoutID);
            logger.info('Initializing roaster was successful');
        } else {
            retryInit();
        }
    } catch (error: any) {
        retryInit(error);
    }
};

const retryInit = (error?: any) => {
    logger.error({
        message: `Initializing roaster failed. Retrying in 1s. Count: #${++retryCounter} Error: ${
            error?.message
        }`,
        payload: {
            response: {
                data: error?.response?.data,
            },
        },
    });
    timeoutID = setTimeout(initRoaster, 100);
};

initRoaster();
