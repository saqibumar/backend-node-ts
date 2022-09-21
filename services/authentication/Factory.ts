import { AuthenticatorType } from '.';
import { Authenticator } from './Authenticator';
import { AutoLoginAuthenticator } from './impl/AutoLoginAuthenticator';
import { CredentialAuthenticator } from './impl/CredentialAuthenticator';
import { PinAuthenticator } from './impl/PinAuthenticator';

export class AuthenticatorFactory {
    private static authenticators: Map<AuthenticatorType, Authenticator>;

    public static init(config: any): void {
        this.authenticators = new Map<AuthenticatorType, Authenticator>();

        const autoLogin = new AutoLoginAuthenticator(config);
        const credential = new CredentialAuthenticator(config);
        const pin = new PinAuthenticator(config);

        this.authenticators.set(AuthenticatorType.AutoLogin, autoLogin);
        this.authenticators.set(AuthenticatorType.Credential, credential);
        this.authenticators.set(AuthenticatorType.PIN, pin);
    }

    public static getAuthenticator(type: AuthenticatorType): Authenticator {
        return this.authenticators.get(type);
    }
}
