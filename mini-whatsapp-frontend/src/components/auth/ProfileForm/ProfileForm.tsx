import { Dispatch, KeyboardEvent, SetStateAction, useEffect, useState } from 'react';
import { useFilePicker } from 'use-file-picker';
import { Else, If, Then } from '@anissoft/react-conditions';
import { Field, Form } from 'formik';

import { useAppDispatch } from '../../../features/store';

import { startUpdatingUser } from '../../../features/auth';
import { setFiles, setFileViewType, showImageView } from '../../../features/ui';

import { useActions, useAuth, useSocket } from '../../../hooks';

import { ImagePicker } from '../../ui';

import { RemoveUserPhotoPayload } from '../../../interfaces/socket';

import { CheckIcon, PencilIcon } from '../../../utils/icons';
import wassSwal from '../../../utils/swal';

import userDefault from '../../../assets/images/default-user.jpg';

import { InputEventField, KeyPressData, ProfileFormFields, ProfileFormProps } from './interfaces';

import '../../../assets/scss/forms.scss';
import './profile-form.scss';

export const ProfileForm = ({ values, isValid }: ProfileFormProps) => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const [ totalChars, setTotalChars ] = useState<number>(25);
    const [ usernameDisabled, setUsernameDisabled ] = useState<boolean>(true);
    const [ descriptioDisabled, setDescriptionDisabled ] = useState<boolean>(true);
    const [ isFocus, setIsFocus ] = useState({ username: false, description: false });

    const [ openFileSelector, { plainFiles } ] = useFilePicker({
        accept: 'image/*',
        multiple: false
    });

    const { startRemoveUserPhoto } = useActions();
    const { user } = useAuth();

    useEffect(() => {
        if (plainFiles.length > 0) {
            const formData = new FormData();
            formData.append('image', plainFiles[0]);

            dispatch(startUpdatingUser({ id: user?.id || '', formData }));
        }
    }, [ plainFiles, dispatch, user?.id ]);

    const handleShowImageViewer = () => {
        dispatch(showImageView());
        dispatch(setFiles({
            files: [{
                _id: user?.id || '',
                user: user?.id || '',
                url: user?.image || '',
                createdAt: user.createdAt || new Date()
            }]
        }));
        dispatch(setFileViewType({ fileViewType: 'profile' }));
    }

    const handleCountCharacters = (value: string) => {;
        const count = 25 - value.length;
        setTotalChars(count);
    }

    const handleKeyPress = ({ e, values, setFieldDisabled }: KeyPressData) => {
        if (e.code !== 'Enter' || !isValid) return;

        handleSubmit(values, setFieldDisabled);
    }

    const handleSubmit = (values: ProfileFormFields, setFieldDisabled: Dispatch<SetStateAction<boolean>>) => {
        if (!isValid) return;

        setFieldDisabled(true);

        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('description', values.description);

        dispatch(startUpdatingUser({ id: user?.id || '', formData }));
    }

    const handleRemovePhoto = async () => {
        const { isConfirmed } = await wassSwal.fire({
            title: '¿Deseas eliminar tu foto de perfil?',
            showCancelButton: true,
            cancelButtonText: 'CANCELAR',
            confirmButtonText: 'ELIMINAR',
            allowOutsideClick: false
        });

        if (isConfirmed) {
            socket.emit('miniwass-remove-user-photo', { userId: user?.id || '' }, (payload: RemoveUserPhotoPayload) => {
                startRemoveUserPhoto(payload);
            });
        }
    }

    return (
        <Form className="form" method="POST" autoComplete="off" encType="multipart/formdata">
            <div className="form__group center-img">
                <ImagePicker 
                    contextMenuId="profile-form-image-picker"
                    height={ 200 }
                    onRemovePhoto={ handleRemovePhoto }
                    onShowPhoto={ handleShowImageViewer }
                    onUploadPhoto={ openFileSelector }
                    showBtnMenuRemovePhoto={ !!user?.image }
                    showBtnMenuShowPhoto={ !!user?.image }
                    source={ (user?.image) ? user.image : userDefault }
                    text="CAMBIAR FOTO DE PERFIL"
                    width={ 200 }
                />
            </div>

            <div className="form__group">
                <label htmlFor="username">Tu nombre</label>

                <div 
                    className={ 
                        (usernameDisabled) 
                            ? 'profile-form-group' 
                            : (isFocus.username)
                                ? 'profile-form-group input-border-active'
                                : 'profile-form-group input-border'
                    }
                >
                    <Field
                        onKeyPress={ 
                            (e: KeyboardEvent<HTMLInputElement>) => { 
                                handleKeyPress({ e, values, setFieldDisabled: setUsernameDisabled }) 
                            }
                        }
                        onInput={ 
                            (e: InputEventField) => handleCountCharacters(e.target.value)
                        }
                        disabled={ usernameDisabled }
                        onFocus={ () => setIsFocus({ ...isFocus, username: true }) }
                        onBlur={ () => setIsFocus({ ...isFocus, username: false }) }
                        type="text" 
                        name="username"
                    />

                    <If condition={ usernameDisabled }>
                        <Then>
                            <button 
                                onClick={ () => setUsernameDisabled(false) }
                                title="Haz click para editar"
                                type="button" 
                            >
                                <PencilIcon />
                            </button>
                        </Then>

                        <Else>
                            <span>{ (totalChars < 1) ? 0 : totalChars }</span>

                            <button 
                                onClick={ () => handleSubmit(values, setUsernameDisabled) }
                                title="Haz click para guardar"
                                type="button"
                            >
                                <CheckIcon />
                            </button>
                        </Else>
                    </If>
                </div>

                <small>Este no es tu nombre de usuario ni un PIN. Este nombre será visible para tus contactos de MiniWhatsApp</small>
            </div>

            <div className="form__group">
                <label htmlFor="description">Info.</label>

                <div 
                    className={
                        (descriptioDisabled) 
                            ? 'profile-form-group' 
                            : (isFocus.description)
                                ? 'profile-form-group input-border-active'
                                : 'profile-form-group input-border'
                    }
                >
                    <Field
                        onKeyPress={ 
                            (e: KeyboardEvent<HTMLInputElement>) => { 
                                handleKeyPress({ e, values, setFieldDisabled: setDescriptionDisabled }) 
                            }
                        }
                        disabled={ descriptioDisabled }
                        onFocus={ () => setIsFocus({ ...isFocus, description: true }) }
                        onBlur={ () => setIsFocus({ ...isFocus, description: false }) }
                        type="text" 
                        name="description" 
                    />

                    <If condition={ descriptioDisabled }>
                        <Then>
                            <button 
                                onClick={ () => setDescriptionDisabled(false) }
                                title="Haz click para editar Info."
                                type="button" 
                            >
                                <PencilIcon />
                            </button>
                        </Then>

                        <Else>
                            <button 
                                onClick={ () => handleSubmit(values, setDescriptionDisabled) }
                                title="Haz click para guardar"
                                type="button"
                            >
                                <CheckIcon />
                            </button>
                        </Else>
                    </If>
                </div>
            </div>
        </Form>
    );
}