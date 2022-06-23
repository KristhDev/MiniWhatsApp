import { Else, If, Then } from '@anissoft/react-conditions';
import { Formik, Form, Field, FormikErrors } from 'formik';
import { object, string } from 'yup';

import { useAppDispatch } from '../../../features/store'; 

import { startAddContact, startUpdatingContact } from '../../../features/auth';

import { useAuth, useChat, useUi } from '../../../hooks';

import { handleShowErrors } from '../../../utils/functions';

import { ContactFormFields, ContactFormValidate } from './interfaces';

import '../../../assets/scss/forms.scss';
import './contact-form.scss';

export const ContactForm = () => {
    const dispatch = useAppDispatch();

    const { contacts } = useAuth();
    const { chatSelected: { users } } = useChat(); 
    const { sideBarMoveType } = useUi();

    const contact = contacts.find(c => c.contact?._id === users[0]?.id);

    const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

    const contactFormSchema = object().shape({
        name: string()
            .required('El nombre es requerido'),
        phone: string()
            .required('El número telefonico es requerido')
            .matches(phoneRegExp, 'Por favor escriba un número de telefono valido')
    });

    const handleSubmit = (values: ContactFormFields, resetForm: () => void) => {
        if (sideBarMoveType === 'edit-contact') {
            dispatch(startUpdatingContact({ id: contact?.id || '', ...values }));
        }
        else {
            dispatch(startAddContact(values));
            resetForm();
        }
    }

    return (
        <div className="contact-form">
            <Formik
                initialValues={{ 
                    name: (sideBarMoveType === 'edit-contact') ? (contact?.name || '') : '',
                    phone: (sideBarMoveType === 'edit-contact') ? (contact?.contact?.phone || '') : ''
                }}
                validationSchema={ contactFormSchema }
                onSubmit={ (values, { resetForm }) => handleSubmit(values, resetForm) }
            >
                { ({ isValid, errors, values }) => (
                    <Form className="form" autoComplete="off" method="POST">
                        <div className="form__group">
                            <Field type="text" name="name" placeholder="Nombre" />
                        </div>

                        <div className="form__group">
                            <Field type="tel" name="phone" placeholder="Telefono" />
                        </div>

                        <div className="form__group">
                            <If condition={ isValid }>
                                <Then>
                                    <button 
                                        type="submit"
                                        disabled={ Object.values(values).map(v => v === '').every(v => v) }
                                        className="btn"
                                    >
                                        GUARDAR
                                    </button>
                                </Then>

                                <Else>
                                    <button 
                                        type="button"
                                        disabled={ Object.values(values).map(v => v === '').every(v => v) }
                                        onClick={ () => handleShowErrors<FormikErrors<ContactFormValidate>>(errors) }
                                        className="btn"
                                    >
                                        GUARDAR
                                    </button>
                                </Else>
                            </If>
                        </div>
                    </Form>
                ) }
            </Formik>
        </div>
    );
}