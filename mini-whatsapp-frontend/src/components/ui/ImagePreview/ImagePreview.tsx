import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useFilePicker } from 'use-file-picker';
import TextareaAutosize from 'react-textarea-autosize';
import { For } from 'react-loops';

import { useAppDispatch } from '../../../features/store';

import { addImagesToUpload, removeAllImagesToUpload, removeImageToUpload } from '../../../features/chat';
import { showLoaderPopup } from '../../../features/ui';

import { useAuth, useChat, useSocket } from '../../../hooks';

import { CancelIcon, PlusIcon, SendMsgIcon } from '../../../utils/icons';

import './image-preview.scss';

export const ImagePreview = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const [ imageContainerHeight, setImageContinerHeight ] = useState<number>(0.63);
    const [ imageIndex, setImageIndex ] = useState<number>(0);
    const [ message, setMessage ] = useState<string>('');

    const { height } = useWindowSize();

    const [ openFileSelector, { plainFiles, filesContent } ] = useFilePicker({
        accept: 'image/*',
        multiple: true,
        readAs: 'DataURL'
    });

    const oldTextareaHeight = useRef<number>(0);

    const { user: { id: userId } } = useAuth();
    const { imagesPreviews, imagesFiles, chatSelected: { id: chatId, destinations } } = useChat();

    const handleRemoveImages = () => dispatch(removeAllImagesToUpload());

    const handleRemoveImage = (e: MouseEvent, index: number) => {
        e.stopPropagation();
        dispatch(removeImageToUpload({ index }));

        if (imageIndex === 0) return;
        setImageIndex(imageIndex - 1);
    }

    const handleAdjustImageContainerHeight = (textareaHeight: number) => {
        if (textareaHeight > oldTextareaHeight.current) {
            setImageContinerHeight(imageContainerHeight - 0.02);
            oldTextareaHeight.current = textareaHeight;
        }
        else {
            setImageContinerHeight(imageContainerHeight + 0.02);
            oldTextareaHeight.current = textareaHeight;
        }
    }

    const handleSubmit = () => {
        dispatch(showLoaderPopup({ 
            msg: (imagesFiles.length === 1) ? 'Enviando imagen' : 'Enviando imagenes', 
        }));

        const data = {
            userId,
            chatId,
            destinations,
            message,
            images: imagesFiles
        }

        socket.emit('miniwass-send-message-image', data);

        dispatch(removeAllImagesToUpload());
        setMessage('');
    }

    useEffect(() => {
        if (plainFiles.length > 0) {
            dispatch(addImagesToUpload({
                imagesPreviews: filesContent.map(f => f.content),
                imagesFiles: plainFiles
            }));
        }
    }, [ plainFiles, filesContent, dispatch ]);

    return (
        <div className="image-preview">
            <button onClick={ handleRemoveImages } className="btn-close">
                <CancelIcon />
            </button>

            <div className="image-preview__content">
                <div 
                    style={{ height: height * imageContainerHeight }}
                    className="img-container" 
                >
                    <img 
                        loading="lazy" 
                        src={ imagesPreviews[imageIndex] } 
                        alt="" 
                    />
                </div>

                <div className="image-form">
                    <div className="form-group">
                        <TextareaAutosize 
                            minRows={ 1 }
                            maxRows={ 5 }
                            placeholder="Escribe un mensaje aquí"
                            onHeightChange={ (e) => handleAdjustImageContainerHeight(e) }
                            onChange={ (e) => setMessage(e.target.value) }
                            value={ message }
                        />
                    </div>
                </div>
            </div>

            <div className="image-preview__actions">
                <div className="images">
                    <For 
                        of={ imagesPreviews }
                        children={ (image, { index }) => (
                            <div 
                                className={ (index === imageIndex) ? 'img-item img-item-active' : 'img-item' }
                                onClick={ () => setImageIndex(index) }
                            >
                                <button
                                    onClick={ (e) => handleRemoveImage(e, index) }
                                >
                                    <CancelIcon />
                                </button>

                                <img 
                                    loading="lazy" 
                                    src={ image } 
                                    alt="" 
                                />
                            </div>
                        ) }
                    />

                    <button onClick={ openFileSelector } className="btn-more-img">
                        <PlusIcon />
                    </button>
                </div>

                <button onClick={ handleSubmit } className="btn-submit">
                    <SendMsgIcon />
                </button>
            </div>
        </div>
    );
}