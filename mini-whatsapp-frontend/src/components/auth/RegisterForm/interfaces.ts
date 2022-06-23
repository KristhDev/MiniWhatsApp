import { FormikErrors } from 'formik';

export interface RegisterFormFields {
    name: string;
    surname: string;
    username: string;
    phone: string;
    password: string;
    passwordConfirm: string;
}

export interface RegisterFormValidate {
    name?: string;
    surname?: string;
    username?: string;
    phone?: string; 
    password?: string;
    passwordConfirm?: string;
}

export type RegisterFormErrors = FormikErrors<RegisterFormValidate>;