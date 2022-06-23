import { Response } from 'express';

export const sendRes = (res: Response, msg: string, status: number) => {
    return res.status(status).json({
        msg,
        status
    });
}