import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { Else, ElseIf, If, Then } from '@anissoft/react-conditions';
import dayjs from 'dayjs';

import { useChat, useSocket } from '../../../hooks';

import { CheckIcon, PencilIcon } from '../../../utils/icons';

import { AddDescriptionFormFields, AddDescriptionProps } from './interfaces';

import '../../../assets/scss/forms.scss';
import './add-description.scss';


export const AddDescription = ({ date, isAdmin }: AddDescriptionProps) => {
    const socket = useSocket();

    const [ descriptionDisabled, setDescriptionDisabled ] = useState<boolean>(true);
    const [ isFocus, setIsFocus ] = useState<boolean>(false);

    const { chatSelected: { id, name, description } } = useChat();

    const handleGetCreatedInfo = () => {
        return `Grupo creado por tí, el ${ dayjs(date).format('DD/MM/YYYY') } a la(s) ${ dayjs(date).format('h:mm a') }`;
    }

    const handleSubmit = (values: AddDescriptionFormFields) => {
        setDescriptionDisabled(true);

        const data = { ...values, name }

        socket.emit('miniwass-edit-group', { chatId: id, data });
    }

    return (
        <div className="add-description">
            <Formik
                initialValues={{ description }}
                onSubmit={ handleSubmit }
            >
                { ({ isValid, values }) => (
                    <Form className="form" autoComplete="off">
                        <div className="form__group">
                            <div className="add-description-group">
                                <If condition={ !descriptionDisabled }>
                                    <Then>
                                        <div 
                                            className={ 
                                                (isFocus) 
                                                    ? 'input-container input-container-active' 
                                                    : 'input-container' 
                                            }
                                        >
                                            <Field 
                                                disabled={ descriptionDisabled }
                                                type="text" 
                                                name="description" 
                                                onFocus={ () => setIsFocus(true) }
                                                onBlur={ () => setIsFocus(false) }
                                            />

                                            <If condition={ isAdmin }>
                                                <button 
                                                    disabled={ !isValid } 
                                                    type="submit"
                                                    title="Haz clic para guardar"
                                                >
                                                    <CheckIcon />
                                                </button>
                                            </If>
                                        </div>
                                    </Then>

                                    <Else>
                                        <If condition={ !!description || !!values.description }>
                                            <Then>
                                                <span className="description-text">{ values.description }</span>
                                            </Then>

                                            <ElseIf condition={ isAdmin }>
                                                <span>Añade una descripción del grupo</span>
                                            </ElseIf>
                                        </If>
                                    </Else>
                                </If>

                                <If condition={ descriptionDisabled && isAdmin }>
                                    <button 
                                        className="pencil-btn"
                                        type="button" 
                                        title="Haz click para editar"
                                        onClick={ () => setDescriptionDisabled(false) }
                                    >
                                        <PencilIcon />
                                    </button>
                                </If>
                            </div>

                            <If condition={ isAdmin }>
                                <span>{ handleGetCreatedInfo() }</span>
                            </If>
                        </div>
                    </Form>
                ) }
            </Formik>
        </div>
    );
}