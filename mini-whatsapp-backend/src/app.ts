import dotenv from 'dotenv';
import Server from './server/server';
import cloudinary from 'cloudinary';

dotenv.config();
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const server = new Server();
server.listen();