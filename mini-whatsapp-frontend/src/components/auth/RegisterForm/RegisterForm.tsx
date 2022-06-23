import { NavLink } from 'react-router-dom';
import { Else, If, Then } from '@anissoft/react-conditions';
import { Formik, Form, Field } from 'formik';
import { object, string, ref } from 'yup';

import { useAppDispatch } from '../../../features/store';

import { startRegister } from '../../../features/auth';

import { phoneRegExp } from '../../../utils/constants';
import { handleShowErrors } from '../../../utils/functions';

import { RegisterFormErrors, RegisterFormFields } from './interfaces';

import './register-form.scss';

export const RegisterForm = () => {
    const dispatch = useAppDispatch();

    const registerFormSchema = object().shape({
        name: string()
            .required('El nombre es requerido')
            .min(2, 'El nombre debe tener como minimo dos caracteres'),
        surname: string()
            .required('El apellido es requerido')
            .min(2, 'El apellido debe tener como minimo dos caracteres'),
        username: string()
            .required('El nombre de usuario es requerido')
            .min(2, 'El nombre de usuario debe tener como minimo dos caracteres'),
        phone: string()
            .required('El número telefonico es requerido')
            .matches(phoneRegExp, 'El número de telefono no es valido'),
        password: string()
            .required('La contraseña es requerida')
            .min(6, 'La contraseña debe tener como minimo 6 caracteres'),
        passwordConfirm: string()
            .required('La confirmación de la contraseña es requerida')
            .oneOf([ ref('password'), null ], 'Las contraseñas no coinciden')
    });

    const handleSubmit = (values: RegisterFormFields, resetForm: () => void) => {
        dispatch(startRegister({
            name: values.name,
            surname: values.surname,
            username: values.username,
            phone: values.phone,
            password: values.password
        }));

        resetForm();
    }

    return (
        <div className="register-form">
            <h2 className="title-screen">Registrate</h2>

            <Formik
                initialValues={{ 
                    name: '',
                    surname: '',
                    username: '',
                    phone: '', 
                    password: '',
                    passwordConfirm: ''
                }}
                validateOnMount
                validationSchema={ registerFormSchema }
                onSubmit={ (values, { resetForm }) => handleSubmit(values, resetForm) }
            >
                { ({ isValid, errors }) => (
                    <Form className="form" autoComplete="off">
                        <div className="form__group">
                            <Field type="text" name="name" placeholder="Nombre" />
                        </div>

                        <div className="form__group">
                            <Field type="text" name="surname" placeholder="Apellido" />
                        </div>

                        <div className="form__group">
                            <Field type="text" name="username" placeholder="Nombre de usuario" />
                        </div>

                        <div className="form__group">
                            <Field type="tel" name="phone" placeholder="Telefono" />
                        </div>

                        <div className="form__group">
                            <Field type="password" name="password" placeholder="Contraseña" />
                        </div>

                        <div className="form__group">
                            <Field type="password" name="passwordConfirm" placeholder="Confirmar contraseña" />
                        </div>

                        <div className="form__group">
                            <If condition={ isValid }>
                                <Then>
                                    <button 
                                        disabled={ !isValid }
                                        type="submit" 
                                        className="btn"
                                    >
                                        REGISTAR
                                    </button>
                                </Then>

                                <Else>
                                    <button 
                                        onClick={ () => handleShowErrors<RegisterFormErrors>(errors) } 
                                        type="button"
                                        className="btn"
                                    >
                                        REGISTAR
                                    </button>
                                </Else>
                            </If>
                        </div>

                        <div className="form__group">
                            <p>
                                ¿Ya tienes cuenta? Ingresa &nbsp;
                                <NavLink to="/login">aquí</NavLink>
                            </p>
                        </div>
                    </Form>
                ) }
            </Formik>
        </div>
    );
}