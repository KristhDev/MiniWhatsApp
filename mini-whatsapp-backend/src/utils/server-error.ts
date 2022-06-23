import { Response } from 'express';

export const serverError = (res: Response, error: unknown) => {
    console.log(error);

    return res.status(500).json({
        msg: 'Ocurrio un error en el servidor, por favor hable con el administrador',
        status: 500
    });
}

export const serverErrorSocket = () => {
    return {
        msg: 'Ocurrio un error en el servidor, por favor hable con el administrador',
        status: 500
    }
}