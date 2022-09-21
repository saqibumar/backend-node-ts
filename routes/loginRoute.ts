// import {BaseAPIRoute} from 'utilsmod/lib/server/baseRestServ'
import {LoginModel} from '../models/loginModel'
// import Log from "utilsmod/lib/log";
import Log from '../services/log';
import {config} from '../config';
import { BaseAPIRoute } from './baseRestServ';
// import {ErrorCodes} from "utilsmod/lib/enums/errorCodes";
import { AuthenticatorFactory, AuthenticatorType } from '../services/authentication';

export enum ErrorCodes {
    AUTH_REQUIRED = 'Authentication required!',
    INVALID_TOKEN = 'Invalid Token',
    UNABLE_TO_REFRESH_TOKEN = 'Unable to refresh Token',
}


export class LoginRoute extends BaseAPIRoute {
    logger = new Log({config, className: "LoginRoute"})
    loginModel: LoginModel;

    constructor(route, app) {
        super(route)

        this.loginModel = LoginModel.getInstance();

        app.get(route + '/test', async (req, res) => {
            // const token = req.headers.authorization.split(" ")[1];
            // const valid = this.loginModel.validateToken(token);

            // return res.json({valid});
            return res.status(200).json({success: `endpoint works`})

            return res.status(403).json({error: `Token validation failed`})
        })

        app.post(route + '/pin', async (req, res) => {
            try {
                const auth = AuthenticatorFactory.getAuthenticator(AuthenticatorType.PIN);
                let data = await auth.login({ pin: req.body.pin, roles: req.body.roles });
                return res.json(data)
            } catch (err) {
                this.logger.error({ message: err.message || err });
                return res.status(403).json({error: err.message, success: false});
            }
        })

        app.post(route + '/login', async (req, res) => {
            try {
                let data = await this.loginModel.login({
                    username: req.body.username,
                    password: req.body.password
                })
                return res.json(data)
            } catch (err) {
                this.logger.error({ message: err.message || err });
                return res.status(403).json({error: err.message, success: false});
            }
        })

        app.post(route + '/sign-out', async (req, res) => {
            try {
                await this.loginModel.signOut();
                return res.json({success: true})
            } catch (err) {
                this.logger.error({ message: err.message || err });
                return res.status(403).json({error: err.message});
            }
        })

        app.get(route + '/me', async (req, res) => {
            try {
                const token = req.headers.authorization.split(" ")[1];
                const valid = this.loginModel.validateToken(token);
                if (valid) return res.json({valid});
            } catch (error) {
                return res.status(403).json({error: `Token validation failed`})
            }
        })

        app.post(route + '/refresh-access-token', async (req, res) => {

            try {
                let token = req.headers.authorization;
                const idToken = req.headers['x-id-token'];
                const refreshToken = req.headers['x-refresh-token'];

                const accessToken = token.split(' ')[1];
                this.loginModel.setTokens({ accessToken, idToken, refreshToken });

                let data = await this.loginModel.refreshAccessToken()
                return res.json(data)
            } catch (err) {
                this.logger.error({ message: ErrorCodes.UNABLE_TO_REFRESH_TOKEN });
                return res.status(403).json({error: ErrorCodes.UNABLE_TO_REFRESH_TOKEN});
            }
        })
    }
}

