import { FormikErrors } from 'formik';

export interface LoginFormFields {
    phone: string;
    password: string;
}

export interface LoginFormValidate {
    phone?: string;
    password?: string;
}

export type LoginFormErrors = FormikErrors<LoginFormValidate>;