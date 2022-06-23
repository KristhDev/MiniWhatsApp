import { MouseEvent } from 'react';
import { useUpdateEffect } from 'react-use';
import { useFilePicker } from 'use-file-picker';
import { For } from 'react-loops';
import { If } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { showLoaderPopup } from '../../../features/ui';

import { useAuth, useSocket } from '../../../hooks';

import { CancelIcon, PlusIcon } from '../../../utils/icons';

import './background.scss';

export const Background = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { user: { settings } } = useAuth();

    const [ openFileSelector, { plainFiles } ] = useFilePicker({
        accept: 'image/*',
        multiple: false
    });

    const handleSetBgChat = (imageUrl: string) => {
        socket.emit('miniwass-set-background-selected', {
            ...settings?.background,
            backgroundSelected: imageUrl
        });
    }

    const handleRemoveBgChat = (e: MouseEvent, imageUrl: string) => {
        e.stopPropagation();

        socket.emit('miniwass-remove-bg-chat', {
            background: imageUrl,
            bgDefault: settings?.background?.backgrounds[0]
        });
    }

    useUpdateEffect(() => {
        if (plainFiles.length > 0) {
            const backgrounds = settings?.background?.backgrounds;
            const newBackground = plainFiles[0];

            dispatch(showLoaderPopup({ msg: 'Subiendo fondo' }));
            socket.emit('miniwass-new-bg-chat', { backgrounds, newBackground });
        }
    }, [ plainFiles ]);

    return (
        <div className="background">
            <For 
                of={ settings?.background?.backgrounds }
                children={ (bgImage, { index }) => (
                    <div 
                        className={ 
                            (bgImage === settings?.background?.backgroundSelected) 
                                ? 'background__image image-selected' 
                                : 'background__image' 
                        }
                        onClick={ () => handleSetBgChat(bgImage) }
                    >
                        <If condition={ index > 1 }>
                            <button onClick={ (e) => handleRemoveBgChat(e, bgImage) }>
                                <CancelIcon />
                            </button>
                        </If>

                        <img
                            loading="lazy"
                            src={ bgImage }
                            alt=""
                        />
                    </div>
                ) }
            />

            <div 
                className="background__more"
                onClick={ openFileSelector }
            >
                <PlusIcon />
            </div>
        </div>
    );
}
