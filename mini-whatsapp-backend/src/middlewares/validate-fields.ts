import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { sendRes } from '../utils/send-res';

export const validateFields = (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);

    if (!error.isEmpty()) {
        return sendRes(res, error.array()[0], 400);
    }

    return next();
}