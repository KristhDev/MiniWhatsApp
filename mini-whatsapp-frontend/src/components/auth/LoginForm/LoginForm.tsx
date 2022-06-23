import { NavLink } from 'react-router-dom';
import { If, Then, Else } from '@anissoft/react-conditions';
import { Formik, Form, Field } from 'formik';
import { object, string } from 'yup';

import { useAppDispatch } from '../../../features/store';

import { startLogin } from '../../../features/auth';

import { handleShowErrors } from '../../../utils/functions';
import { phoneRegExp } from '../../../utils/constants';

import { LoginFormErrors, LoginFormFields } from './interfaces';

import '../../../assets/scss/forms.scss';
import './login-form.scss';


export const LoginForm = () => {
    const dispatch = useAppDispatch();

    const loginFormSchema = object().shape({
        phone: string()
            .required('El número de telefono no puede estar vacio')
            .matches(phoneRegExp, 'Por favor escriba bien su número telefonico'),
        password: string()
            .required('La contraseña es requerida')
            .min(6, 'La contraseña debe tener como minimo 6 caracteres')
    });

    const handleSubmit = (values: LoginFormFields, resetForm: () => void) => {
        dispatch(startLogin(values));
        resetForm();
    }

    return (
        <div className="login-form">
            <h2 className="title-screen">Ingresa y chatea con todos</h2>

            <Formik
                initialValues={{ 
                    phone: '',
                    password: ''
                }}
                validateOnMount
                validationSchema={ loginFormSchema }
                onSubmit={ (values, { resetForm }) => handleSubmit(values, resetForm) }
            >
                { ({ isValid, errors }) => (
                    <Form className="form" autoComplete="off">
                        <div className="form__group">
                            <Field type="tel" name="phone" placeholder="Telefono" />
                        </div>

                        <div className="form__group">
                            <Field type="password" name="password" placeholder="Contraseña" />
                        </div>

                        <div className="form__group">
                            <If condition={ isValid }>
                                <Then>
                                    <button 
                                        disabled={ !isValid } 
                                        type="submit"
                                    >
                                        INGRESAR
                                    </button>
                                </Then>

                                <Else>
                                    <button 
                                        onClick={ () => handleShowErrors<LoginFormErrors>(errors) }
                                        type="button"
                                    >
                                        INGRESAR
                                    </button> 
                                </Else>
                            </If>
                        </div>

                        <div className="form__group">
                            <p>
                                Si no tiene cuenta, cree una &nbsp;
                                <NavLink to="/register">aquí</NavLink>
                            </p>
                        </div>
                    </Form>
                ) }
            </Formik>
        </div>
    );
}
