import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { Else, If, Then } from '@anissoft/react-conditions';
import { object, string } from 'yup';

import { useAuth, useChat, useSocket } from '../../../hooks';

import { CheckIcon, PencilIcon } from '../../../utils/icons';

import { EditGroupFormFields, InputEventField } from './interfaces';

import '../../../assets/scss/forms.scss';
import './edit-group-name.scss';

export const EditGroupName = () => {
    const editFormSchema = object().shape({
        name: string()
            .required('El nombre del grupo es requerido')
            .max(25, 'El nombre del grupo no puede tener más de 25 caracteres')
    });

    const [ totalChars, setTotalChars ] = useState<number>(25);
    const [ isNameDisabled, setIsNameDisabled ] = useState<boolean>(true);
    const [ isFocus, setIsFocus ] = useState<boolean>(false);

    const socket = useSocket();

    const { user, chats } = useAuth();
    const { chatSelected: { id, name, description } } = useChat();

    const chat = chats.find(c => c.id === id);
    const isAdmin = !!chat?.admins?.includes(user?.id || '');

    const handleCountCharacters = (value: string) => {;
        const count = 25 - value.length;
        setTotalChars(count);
    }

    const handleSubmit = (values: EditGroupFormFields) => {
        setIsNameDisabled(true);

        const data = { ...values, description }

        socket.emit('miniwass-edit-group', { chatId: id, data });
    }

    return (
        <div className="edit-group-name">
            <Formik
                initialValues={{ name }}
                validationSchema={ editFormSchema }
                onSubmit={ (values) => handleSubmit(values) }
            >
                { ({ isValid, values }) => (
                    <Form className="form" autoComplete="off">
                        <div className="form__group">
                            <If condition={ isNameDisabled }>
                                <Then>
                                    <div className="group-name">
                                        <h4 
                                            style={{ marginLeft: (isAdmin) ? '2rem' : 0 }} 
                                        >
                                            { values.name }
                                        </h4>

                                        <If condition={ isAdmin }>
                                            <button 
                                                type="button"
                                                onClick={ () => setIsNameDisabled(false) }
                                            >
                                                <PencilIcon />
                                            </button>
                                        </If>
                                    </div>
                                </Then>

                                <Else>
                                    <div 
                                        className={ 
                                            (isFocus) 
                                                ? 'group-name group-name-input-active' 
                                                : 'group-name group-name-input'
                                        }
                                    >
                                        <Field 
                                            disabled={ isNameDisabled }
                                            type="text" 
                                            name="name" 
                                            onFocus={ () => setIsFocus(true) }
                                            onBlur={ () => setIsFocus(false) }
                                            onInput={ 
                                                (e: InputEventField) => handleCountCharacters(e.target.value)
                                            }
                                        />

                                        <If condition={ isAdmin }>
                                            <span>{ (totalChars < 1) ? 0 : totalChars }</span>

                                            <button 
                                                disabled={ !isValid } 
                                                className="check-submit-btn" 
                                                type="submit"
                                            >
                                                <CheckIcon />
                                            </button>
                                        </If>
                                    </div>
                                </Else>
                            </If>
                        </div>
                    </Form>
                ) }
            </Formik>
        </div>
    );
}