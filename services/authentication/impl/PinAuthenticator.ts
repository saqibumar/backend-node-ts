import axios from 'axios';
import Logger from '../../../services/log';
import { Authenticator } from '../Authenticator';
import * as jwt from 'jsonwebtoken';

export class PinAuthenticator implements Authenticator {
    private static SERVICE_DEFAULT_BASE_URL = 'http://localhost:6000';

    config: any;
    logger: Logger;
    baseUrl: string;
    userAttributes: any;
    readonly tokens = {
        accessToken: null,
        idToken: null,
        refreshToken: null,
    };

    public constructor(config: any) {
        this.config = config;
        this.logger = new Logger({
            config,
            className: 'PinAuthenticator',
        });

        this.baseUrl =
            config.authentication?.autoLoginBaseUrl ||
            PinAuthenticator.SERVICE_DEFAULT_BASE_URL;
    }

    private async fetchTokens({pin, roles}): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/pin`;
            const response = await axios.post(endpoint, {pin, roles}, { timeout: 30000 });

            const { accessToken, idToken, refreshToken } = response.data;

            if (!this.verifyToken(accessToken)) {
                const message =
                    'Pin authentication failed. Received an expired access token';
                this.logger.warn({
                    message,
                    accessToken,
                });

                throw new Error(message);
            }

            this.logger.info('Pin authentication was successful', true);

            this.setUserAttributes(idToken);

            return { accessToken, idToken, refreshToken };
        } catch (err: any) {
            this.logger.error(
                `Pin authentication failed. Reason: ${
                    err.stack || err.message
                }`
            );
            throw err;
        }
    }

    public async login(user?: any): Promise<any> {
        return await this.fetchTokens(user);
    }

    public async signOut(): Promise<any> {}

    public async refreshAccessToken(): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/refresh-tokens`;
            this.setUserAttributes(this.tokens.idToken);
            const user = await this.getUserAttributes();

            const response = await axios.post(endpoint, {refreshToken: this.tokens.refreshToken, email: user?.email}, { timeout: 10000 });

            const { accessToken, idToken, refreshToken } = response.data;

            if (!this.verifyToken(accessToken)) {
                const message =
                    'Refreshing access token failed.';
                this.logger.warn({
                    message,
                    accessToken,
                });

                throw new Error(message);
            }

            this.logger.info('Pin authentication was successful', true);

            this.setUserAttributes(idToken);

            return { accessToken, idToken, refreshToken };
        } catch (err: any) {
            this.logger.error(
                `Pin refresh token failed. Reason: ${
                    err.stack || err.message
                }`
            );
            throw err;
        }
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
        const rolesKey = 'custom:roles';

        const attrib = { ...this.userAttributes };

        attrib[storesKey] = attrib[storesKey] ? attrib[storesKey] : [''];
        attrib[cafesKey] = attrib[cafesKey] ? attrib[cafesKey] : [''];
        attrib[rolesKey] = attrib[rolesKey] ? attrib[rolesKey] : [''];

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
            this.logger.error({
                message: `Setting user attributes from idToken failed - ${error.message}`,
                payload: { idToken },
                stack: error.stack,
            });
        }
    }
}
