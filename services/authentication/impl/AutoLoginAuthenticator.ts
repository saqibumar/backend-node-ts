import axios from 'axios';
// import Logger from 'utilsmod/lib/log';
import { Authenticator } from '../Authenticator';
import * as jwt from 'jsonwebtoken';

export class AutoLoginAuthenticator implements Authenticator {
    private static SERVICE_DEFAULT_BASE_URL = 'http://localhost:6000';

    config: any;
    // logger: Logger;
    baseUrl: string;
    userAttributes: any;
    readonly tokens = {
        accessToken: null,
        idToken: null,
        refreshToken: null,
    };

    public constructor(config: any) {
        this.config = config;
        /* this.logger = new Logger({
            config,
            className: 'AutoLoginAuthenticator',
        }); */

        this.baseUrl =
            config.authentication?.autoLoginBaseUrl ||
            AutoLoginAuthenticator.SERVICE_DEFAULT_BASE_URL;
    }

    private async fetchTokens(): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/token`;
            const response = await axios.get(endpoint, { timeout: 10000 });

            const { accessToken, idToken, refreshToken } = response.data;

            if (!this.verifyToken(accessToken)) {
                const message =
                    'Auto-login authentication failed. Received an expired access token';
                /* this.logger.warn({
                    message,
                    accessToken,
                }); */

                throw new Error(message);
            }

            // this.logger.info('Auto-login authentication was successful', true);

            this.setUserAttributes(idToken);

            return { accessToken, idToken, refreshToken };
        } catch (err: any) {
            /* this.logger.error(
                `Auto-login authentication failed. Reason: ${
                    err.stack || err.message
                }`
            ); */
            throw err;
        }
    }

    public async login(user?: any): Promise<any> {
        return await this.fetchTokens();
    }

    public async signOut(): Promise<any> {}

    public async refreshAccessToken(): Promise<any> {
        return await this.fetchTokens();
    }

    public verifyToken(accessToken: any): boolean {
        const decodedToken: any = jwt.decode(accessToken);

        if (!decodedToken) return false;

        const now = new Date();
        const expiresAt = new Date(decodedToken.exp * 1000);

        const remainingTime = expiresAt.getTime() - now.getTime();

        return remainingTime > 0;
    }

    public async getUserAttributes(): Promise<any> {
        const storesKey = 'custom:stores';
        const cafesKey = 'custom:cafes';

        const attrib = { ...this.userAttributes };

        attrib[storesKey] = attrib[storesKey] ? attrib[storesKey] : [''];
        attrib[cafesKey] = attrib[cafesKey] ? attrib[cafesKey] : [''];

        return attrib;
    }

    public setTokens({ accessToken, idToken, refreshToken }): void {
        this.tokens.accessToken = accessToken;
        this.tokens.idToken = idToken;
        this.tokens.refreshToken = refreshToken;

        this.setUserAttributes(idToken);
    }

    private setUserAttributes(idToken: string): void {
        try {
            this.userAttributes = jwt.decode(idToken);
        } catch (error: any) {
            /* this.logger.error({
                message: `Setting user attributes from idToken failed - ${error.message}`,
                payload: { idToken },
                stack: error.stack,
            }); */
        }
    }
}
