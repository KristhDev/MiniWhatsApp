import { Router } from 'express';
import { check } from 'express-validator';

import { validateFields } from '../middlewares/validate-fields';
import { validateJWT } from '../middlewares/validate-jwt';

import { userExists } from '../validations/database';
import { isMyAcount } from '../validations/auth';

import { create, login, renew, update, destroy } from '../controllers/auth';


const router = Router();

router.post('/register', [
    check('name', 'El nombre es requerido').notEmpty(),
    validateFields,
    check('surname', 'El apellido es requerido').notEmpty(),
    validateFields,
    check('username', 'El nombre de usuario es requerido').notEmpty(),
    validateFields,
    check('phone', 'The número telefónico es requerido').notEmpty(),
    validateFields,
    check('phone', 'Por favor escriba bien su número de teléfono').isMobilePhone('any'),
    validateFields,
    check('phone').custom((phone: string) => userExists({ phone }, true)),
    validateFields,
    check('password', 'La contraseña es requerida').notEmpty(),
    validateFields,
    check('password', 'La contraseña debe tener como minimo 6 caracteres'),
    validateFields
], create);

router.post('/login', [
    check('phone', 'The número telefónico es requerido').notEmpty(),
    validateFields,
    check('phone', 'Por favor escriba bien su número de teléfono').isMobilePhone('any'),
    validateFields,
    check('phone').custom((phone: string) => userExists({ phone })),
    validateFields,
    check('password', 'La contraseña es requerida').notEmpty(),
    validateFields,
    check('password', 'La contraseña debe tener como minimo 6 caracteres'),
    validateFields
], login);

router.get('/renew', validateJWT, renew);

router.put('/:id', [
    validateJWT,
    check('id', 'Esta id no es valida').isMongoId(),
    validateFields,
    check('id').custom((id: string) => isMyAcount(id)),
    validateFields
], update);

router.delete('/:id', [
    validateJWT,
    check('id', 'Esta id no es valida').isMongoId(),
    validateFields,
    check('id').custom((id: string) => isMyAcount(id)),
    validateFields
], destroy);

export default router;