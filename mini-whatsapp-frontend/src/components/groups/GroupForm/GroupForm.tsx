import { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { Field, Form, Formik } from 'formik';
import { useFilePicker } from 'use-file-picker';
import { Else, If, Then } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { removeSelectedContacts } from '../../../features/auth';
import { hideSidebarMove } from '../../../features/ui';

import { useAuth, useSocket } from '../../../hooks';

import { ImagePicker } from '../../ui';

import { CheckIcon, HappyFaceIcon } from '../../../utils/icons';

import groupDefault from '../../../assets/images/group-default.png';

import { GroupFormFields, InputEventField } from './interfaces';

import '../../../assets/scss/forms.scss';
import './group-form.scss';

export const GroupForm = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const [ totalChars, setTotalChars ] = useState<number>(25);
    const [ imgGroupPrev, setImgGroupPrev ] = useState<string>('');

    const [ openFileSelector, { plainFiles, filesContent } ] = useFilePicker({
        accept: 'image/*',
        multiple: false,
        readAs: 'DataURL'
    });

    const { selectedContacts, contacts } = useAuth();

    const handleCountCharacters = (value: string) => {;
        const count = 25 - value.length;
        setTotalChars(count);
    }

    const handleSubmit = (name: string, resetForm: () => void) => {
        if (name.length < 1 || name.length > 25) return;

        const usersPhones = contacts.map(
            c => selectedContacts.includes(c?.contact?._id || '') ? (c?.contact?.phone || '') : ''
        ).filter(Boolean);

        const groupInfo: GroupFormFields = { name, usersIds: selectedContacts, usersPhones };

        if (plainFiles.length > 0) groupInfo.image = plainFiles[0];

        socket.emit('miniwass-create-group', groupInfo);

        resetForm();
        dispatch(hideSidebarMove());
        dispatch(removeSelectedContacts());
    }

    useUpdateEffect(() => {
        if (filesContent?.length > 0) {
            const fileString = filesContent[0]?.content;
            setImgGroupPrev(fileString);
        }
    }, [ filesContent ]);

    return (
        <div className="group-form">
            <Formik
                initialValues={{
                    name: ''
                }}
                onSubmit={ (values, { resetForm }) => handleSubmit(values.name, resetForm) }
            >
                {
                    ({ values }) => (
                        <Form className="form" autoComplete="off" method="POST" encType="multipart/formdata">
                            <div className="form__group center-img">
                                <If condition={ imgGroupPrev.length === 0 }>
                                    <Then>
                                        <ImagePicker 
                                            className="img-group"
                                            contextMenuId="group-form-img-picker"
                                            height={ 200 }
                                            onUploadPhoto={ openFileSelector }
                                            showBtnMenuRemovePhoto={ false }
                                            showBtnMenuShowPhoto={ false }
                                            source={ groupDefault }
                                            text="AÑADIR IMAGEN DEL GRUPO"
                                            width={ 200 }
                                        />
                                    </Then>

                                    <Else>
                                        <ImagePicker 
                                            contextMenuId="group-form-img-prev-picker"
                                            height={ 200 }
                                            onUploadPhoto={ openFileSelector }
                                            showBtnMenuRemovePhoto={ false }
                                            showBtnMenuShowPhoto={ false }
                                            source={ imgGroupPrev }
                                            text="CAMBIAR IMAGEN DEL GRUPO"
                                            width={ 200 }
                                        />
                                    </Else>
                                </If>
                            </div>

                            <div className="form__group group-form-group">
                                <Field 
                                    type="text"
                                    name="name"
                                    placeholder="Asunto del grupo"
                                    onInput={ 
                                        (e: InputEventField) => handleCountCharacters(e.target.value)
                                    }
                                />

                                <div className="chars">
                                    <span>{ (totalChars < 1) ? 0 : totalChars }</span>

                                    <HappyFaceIcon />
                                </div>
                            </div>

                            <div 
                                className={ (values?.name) ? 'group-form-submit show-btn' : 'group-form-submit' }
                            >
                                <button type="submit">
                                    <CheckIcon />
                                </button>
                            </div>
                        </Form>
                    )
                }
            </Formik>
        </div>
    );
}