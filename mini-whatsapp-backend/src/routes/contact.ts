import { Router } from 'express';
import { check } from 'express-validator';

import { newContact } from '../middlewares/new-contact';
import { validateJWT } from '../middlewares/validate-jwt';
import { validateFields } from '../middlewares/validate-fields';

import { isMyContact } from '../validations/auth';
import { contactExists, userExists } from '../validations/database';

import { create, destroy, update } from '../controllers/contact';

const router = Router();

router.post('/', [
    validateJWT,
    check('name', 'El nombre no es requerido').notEmpty(),
    validateFields,
    check('phone', 'Por favor escriba bien su número de teléfono').isMobilePhone('any'),
    validateFields,
    check('phone').custom((phone: string) => userExists({ phone })),
    validateFields,
    newContact
], create);

router.put('/:id', [
    validateJWT,
    check('id', 'La id es requerida').notEmpty(),
    validateFields,
    check('id', 'La id no es valida').isMongoId(),
    validateFields,
    check('id').custom((id: string) => contactExists({ _id: id })),
    validateFields,
    check('id').custom((id: string) => isMyContact(id)),
    validateFields
], update);

router.delete('/:id', [
    validateJWT,
    check('id', 'La id es requerida').notEmpty(),
    validateFields,
    check('id', 'La id no es valida').isMongoId(),
    validateFields,
    check('id').custom((id: string) => contactExists({ _id: id })),
    validateFields,
    check('id').custom((id: string) => isMyContact(id)),
    validateFields
], destroy);

export default router;