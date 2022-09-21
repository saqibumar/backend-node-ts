import { Authenticator } from '../Authenticator';
import Logger from '../../../services/log';
// import { Cognito } from '../../../auth/cognito';

export class CredentialAuthenticator implements Authenticator {
    // private cognitoService: Cognito;
    private logger: Logger;

    public constructor(config: any) {
        // this.cognitoService = new Cognito(config);
        this.logger = new Logger({ config, className: 'LoginModel' });
    }

    public async login({
        username = 'betainthelab@bellwethercoffee.com',
        password = 'bY3sT8bT9xX0uI0n',
    }): Promise<any> {
        // const token = await this.cognitoService.signIn({ username, password });
        const token = null; //TODO: get token

        return {
            accessToken: token,
        };
    }

    public async signOut() {
        // return await this.cognitoService.signOut();
    }

    public async refreshAccessToken() {
        // return await this.cognitoService.refreshAccessToken();
    }

    public verifyToken(token: string): boolean {
        // return this.cognitoService.verifyToken(token);
        return false;
    }

    public async getUserAttributes(): Promise<any> {
        // return await this.cognitoService.getUserAttributes();
    }

    public setTokens({ accessToken, idToken, refreshToken }): void {}
}
