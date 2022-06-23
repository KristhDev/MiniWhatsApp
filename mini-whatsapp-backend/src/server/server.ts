import { createServer, Server as HttpServer } from 'http';
import { Server as IoServer, Socket } from 'socket.io';
import express, { Application } from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';

import dbConnection from '../database/config';

import authRoutes from '../routes/auth';
import contactRoutes from '../routes/contact';

import SocketController from '../socket/controller';

export default class Server {
    private app: Application;
    private port: string;
    private server: HttpServer;
    private io: IoServer;
    private apiPaths = {
        users: '/api/users',
        contact: '/api/contacts'
    }

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '9000';
        this.server = createServer(this.app);

        this.io = new IoServer(this.server, {
            cors: {
                origin: process.env.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                allowedHeaders: ['x-token'],
                credentials: true
            },
            maxHttpBufferSize: 100000000
        });

        this.connectDB();
        this.middlewares();
        this.routes();
        this.sockets();
    }

    private async connectDB() {
        await dbConnection();
    }

    private middlewares(): void {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
    }

    private routes(): void {
        this.app.use(this.apiPaths.users, authRoutes);
        this.app.use(this.apiPaths.contact, contactRoutes);
    }

    private sockets(): void {
        this.io.on('connection', async (socket: Socket) => await SocketController(socket, this.io));
    }

    public listen(): void {
        this.server.listen(this.port, () => {
            console.log(`Server in port: ${ this.port }`);
        });
    }
}