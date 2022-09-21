import {RestServ} from '../routes/baseRestServ'

export class SocketRestServ extends RestServ {
    static _io = null
   
    constructor(CORSorigins) {
        super(CORSorigins)

        var corsOptions = {
            origin: CORSorigins,
            methods: ["*"],
            credentials: true
        }

        SocketRestServ._io = require("socket.io")(this._server, {
            cors: corsOptions
        })
    }

    static get io() {
        return SocketRestServ._io
    }
}