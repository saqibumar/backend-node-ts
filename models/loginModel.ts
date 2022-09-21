// import Log from 'utilsmod/lib/log';
import {
    AuthenticatorFactory,
    AuthenticatorType,
} from '../services/authentication';

import { config } from '../config';

AuthenticatorFactory.init(config);
const authenticatorType =
    config.authentication?.type || AuthenticatorType.AutoLogin;
const authenticator = AuthenticatorFactory.getAuthenticator(authenticatorType);

export class LoginModel {
    private static instance: LoginModel;
    // private logger: Log;

    private constructor() {
        // this.logger = new Log({ config, className: 'LoginModel' });
    }

    public static getInstance(): LoginModel {
        if (!this.instance) this.instance = new LoginModel();

        return this.instance;
    }

    async login(user: any): Promise<any> {
        return await authenticator.login(user);
    }

    public async signOut() {
        return await authenticator.signOut();
    }

    public async refreshAccessToken() {
        return await authenticator.refreshAccessToken();
    }

    public validateToken(token: string): boolean {
        return authenticator.verifyToken(token);
    }

    public setTokens({ accessToken, idToken, refreshToken }) {
        authenticator.setTokens({ accessToken, idToken, refreshToken });
    }
}
