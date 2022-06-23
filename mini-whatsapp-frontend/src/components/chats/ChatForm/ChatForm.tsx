import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Else, If, Then } from '@anissoft/react-conditions';
import { Field, Form, Formik } from 'formik';
import { useFilePicker } from 'use-file-picker';
import TextareaAutosize from 'react-textarea-autosize';

import { useAppDispatch } from '../../../features/store';

import { removeIsRespMessage, removeResponseMessage, setChatHeight, setImagesToUpload, toggleIsShowGifs } from '../../../features/chat';

import { useAuth, useChat, useSocket } from '../../../hooks';

import { MessageResponse } from '../MessageResponse';
import { MessageGif } from '../MessageGif';
import { Fab } from '../../ui';

import { handleGetUsername } from '../../../utils/functions';
import { CancelIcon, ClipIcon, GifIcon, SendMsgIcon } from '../../../utils/icons';

import { ChatFormFields, ChatFormValidate, TextAreaEvent } from './interfaces';

import './chat-form.scss';

export const ChatForm = () => {
    const dispatch = useAppDispatch();

    const [ showActions, setShowActions ] = useState<boolean>(false);

    const chatFormRef = useRef() as MutableRefObject<HTMLDivElement>;
    const messageRespRef = useRef() as MutableRefObject<HTMLDivElement>;
    const messageGifRef = useRef() as MutableRefObject<HTMLDivElement>;

    const [ openFileSelector, { plainFiles, filesContent } ] = useFilePicker({
        accept: 'image/*',
        multiple: true,
        readAs: 'DataURL'
    });

    const { user: { blockedUsers, id: authId }, contacts } = useAuth();
    const { 
        messages, 
        chatSelected: { id, destinations, users, isGroup }, 
        isRespMessage, 
        responseMessage,
        isShowGifs
    } = useChat();
    const socket = useSocket();

    const messageResponse = messages.find(m => m._id === responseMessage);

    const isMeBlocked = () => !!users[0]?.blockedUsers?.includes(authId || '');
    const isUserBlocked = () => !!blockedUsers?.includes(users[0].id || '');

    const blocked = ((isMeBlocked() || isUserBlocked()) && !isGroup);

    const handleValidate = (values: ChatFormFields) => {
        const errors: ChatFormValidate = {};
        if (!values.message) errors.message = 'Por favor escribe algo para enviarlo';

        return errors;
    }

    const handleResponseMessage = () => {
        dispatch(removeResponseMessage());
        dispatch(removeIsRespMessage());
    }

    const handlePressEnter = (e: TextAreaEvent, values: ChatFormFields, resetForm: () => void) => {
        if (e.code !== 'Enter' || !(values.message.trim())) return;
        e.preventDefault();

        if (blocked) return;

        handleSendMessage(values, resetForm);
    }

    const handleSendMessage = (values: ChatFormFields, resetForm: () => void) => {
        socket.emit('miniwass-send-message', { 
            message: values.message, 
            chatSelected: { 
                id, 
                respMsgId: responseMessage,
                destinations
            } 
        });

        if (isRespMessage) handleResponseMessage();

        resetForm();
    }

    const handleSelectImage = () => {
        if (blocked) return;

        setShowActions(false);
        openFileSelector();
    }

    const handleShowGifs = () => {
        dispatch(removeIsRespMessage());
        dispatch(toggleIsShowGifs());
    }

    useEffect(() => {
        if (isRespMessage) {
            dispatch(setChatHeight({ 
                chatHeight: (chatFormRef?.current?.clientHeight || 0) + (messageRespRef.current?.clientHeight || 0) 
            }));
        }
        else if (isShowGifs) {
            dispatch(setChatHeight({ 
                chatHeight: (chatFormRef?.current?.clientHeight || 0) + (messageGifRef.current?.clientHeight || 0) 
            }));
        }
        else {
            dispatch(setChatHeight({ chatHeight: chatFormRef?.current?.clientHeight || 0 }));
        }
    }, [ isRespMessage, dispatch, isShowGifs ]);

    useEffect(() => {
        setShowActions(false);
    }, [ id ]);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (plainFiles.length > 0) {
            timeOut = setTimeout(() => {
                dispatch(setImagesToUpload({
                    imagesPreviews: filesContent.map(f => f.content),
                    imagesFiles: plainFiles
                }));
            }, 100);
        }

        return () => {
            clearTimeout(timeOut);
        }
    }, [ plainFiles, filesContent, dispatch ]);

    return (
        <div className="chat-form" ref={ chatFormRef }>
            <div 
                ref={ messageRespRef } 
                className={ (isRespMessage) ? 'message-resp show-message-resp' : 'message-resp' }
            >
                <MessageResponse  
                    content={ messageResponse?.content || '' }
                    image={ messageResponse?.src?.image || messageResponse?.src?.gif }
                    imageSize={ 80 }
                    userId={ messageResponse?.user || '' }
                    userName={ handleGetUsername(messageResponse?.user || '', users, contacts) || '' }
                />

                <button onClick={ handleResponseMessage }>
                    <CancelIcon />
                </button>
            </div>

            <div 
                ref={ messageGifRef }
                className={ (isShowGifs) ? 'message-gif message-gif__show' : 'message-gif'}
            >
                <MessageGif />
            </div>

            <Formik
                initialValues={{ message: '' }}
                validate={ (values) => handleValidate(values) }
                onSubmit={ (values, { resetForm }) => handleSendMessage(values, resetForm) }
            >
                { ({ values, resetForm, isValid }) => (
                    <Form>
                        <Fab 
                            color="#BF59CF"
                            icon="image"
                            onClick={ handleSelectImage }
                            showButton={ showActions }
                        />

                        <button
                            className="gif" 
                            type="button"
                            disabled={ blocked }
                            onClick={ handleShowGifs }
                        >
                            <GifIcon/>
                        </button>

                        <button 
                            onClick={ () => setShowActions(!showActions) } 
                            className="adjunt" 
                            disabled={ blocked }
                            type="button"
                            title="Adjuntar"
                        >
                            <ClipIcon />
                        </button>

                        <div className="chat-form-group">
                            <Field 
                                onKeyPress={ (e: TextAreaEvent) => handlePressEnter(e, values, resetForm) } 
                                name="message" 
                                as={ TextareaAutosize } 
                                minRows={ 1 }
                                maxRows={ 4 }
                                placeholder="Escribe un mensaje aquí"
                                title="Escribe un mensaje aquí"
                            />
                        </div>

                        <If condition={ !!values.message }>
                            <Then>
                                <button type="submit" disabled={ !isValid || blocked }>
                                    <SendMsgIcon />
                                </button>
                            </Then>

                            <Else>
                                <div className="space" />
                            </Else>
                        </If>
                    </Form>
                ) }
            </Formik>
        </div>
    );
}