import { If } from '@anissoft/react-conditions';
import { MouseEvent } from 'react';
import { contextMenu, Item, Menu } from 'react-contexify';

import { CameraIcon } from '../../../utils/icons';

import { ImagePickerProps } from './interfaces';

import './image-picker.scss';

export const ImagePicker = ({ text, source, width, height, className, contextMenuId, onRemovePhoto, onShowPhoto, onUploadPhoto, showBtnMenuRemovePhoto = true, showBtnMenuShowPhoto = true, showBtnMenuUploadPhoto = true }: ImagePickerProps) => {
    const handleToggleMenuOptions = (e: MouseEvent) => {
        contextMenu.show({
            id: contextMenuId || '',
            event: e
        });
    }

    return (
        <div 
            style={{ width, height }} 
            className={ `img-mask ${ className }` }
            title="Selector de foto"
        >
            <div className="img-camera" onClick={ handleToggleMenuOptions }>
                <CameraIcon />

                <p>{ text }</p>
            </div>

            <img 
                src={ source } 
                alt="group-default"
                loading="lazy"
            />

            <Menu id={ contextMenuId || '' }>
                <If condition={ showBtnMenuShowPhoto }>
                    <Item onClick={ onShowPhoto }>Ver foto</Item>
                </If>

                <If condition={ showBtnMenuUploadPhoto }>
                    <Item onClick={ onUploadPhoto }>Subir foto</Item>
                </If>

                <If condition={ showBtnMenuRemovePhoto }>
                    <Item onClick={ onRemovePhoto }>Eliminar foto</Item>
                </If>
            </Menu>
        </div>
    );
}