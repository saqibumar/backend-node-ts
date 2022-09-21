import express, { Application } from 'express';

const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieSession = require('cookie-session')


/**
 * Should be single socket for everything.
 * important to configure CORS with the FE port and domain
 * Has an express
 */
export class RestServ {
    _expInst ; // forces single port in case of static content

    _server;

    constructor(CORSorigins) {
        var corsOptions = {
            origin: "*",
            methods: ['*'],
            credentials: true,
        };

        this._expInst = express();
        this._expInst.use(cors(corsOptions)); // this is a security issue, TODO fix, CORS 1

        this._expInst.use(cookieParser());
        this._expInst.set('trust proxy', 1)
        this._expInst.use(cookieSession({
            name: 'session',
            keys: ['testKey'],
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }))


        this._server = require('http').createServer({}, this._expInst);
        this._expInst.use(express.json());
        this._expInst.use(express.urlencoded({ extended: false }));

    }

    get app() {
        return this._expInst;
    }

    /**
     * Start server
     * @param port
     */
    listen(port: number = 8080) {
        this._server.listen(port);
        console.log('Services running on port', port);
    } //()
} //class

export class BaseAPIRoute {
    _cache: string;

    _route: string;

    /**
     * You likely want browser cache to be a bit larger than edge cache
     * @param broT browser cache
     * @param cdnT  CDN/edge cache
     */
    constructor(route: string, broT?, cdnT?) {
        this._route = route;
        if (!broT) broT = 1;
        if (!cdnT) cdnT = 1;

        this._cache = 'public, max-age=' + broT + ', s-max-age=' + cdnT;
    } //()
} //class
