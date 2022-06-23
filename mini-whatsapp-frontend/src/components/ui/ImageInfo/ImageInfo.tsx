import { Else, If, Then } from '@anissoft/react-conditions';

import { useChat, usePrivacy } from '../../../hooks';

import { EditGroupName } from '../../groups';
import { ImagePicker } from '../ImagePicker';

import { PencilIcon } from '../../../utils/icons';

import userDefault from '../../../assets/images/default-user.jpg';

import { ImageInfoProps } from './interfaces';

import './image-info.scss';

export const ImageInfo = ({ image, title, onClick, text, isGroup, isAdmin = false, contextMenuId, onRemovePhoto, onUploadPhoto, onShowPhoto, showBtnMenuRemovePhoto = true }: ImageInfoProps) => {
    const { chatSelected: { users } } = useChat();
    const { showUserPrivacy } = usePrivacy();

    const showImage = (isGroup) 
        ? true
        : showUserPrivacy(users[0]?.settings?.privacy?.profilePhoto || 'all', users[0]?.id || ''); 

    return (
        <div className="image-info">
            <If condition={ isGroup && isAdmin }>
                <Then>
                    <ImagePicker
                        className="img-space"
                        height={ 200 }
                        source={ image }
                        text="CAMBIAR IMAGEN DEL GRUPO"
                        width={ 200 }
                        contextMenuId={ contextMenuId }
                        onRemovePhoto={ onRemovePhoto }
                        onShowPhoto={ onShowPhoto }
                        onUploadPhoto={ onUploadPhoto }
                        showBtnMenuRemovePhoto={ showBtnMenuRemovePhoto }
                    />
                </Then>

                <Else>
                    <div className="img-container">
                        <img 
                            alt={ title } 
                            loading="lazy"
                            onClick={ onShowPhoto }
                            src={ (showImage) ? image : userDefault } 
                        />
                    </div>
                </Else>
            </If>

            <div className="img-edit">
                <If condition={ isGroup }>
                    <Then>
                        <EditGroupName />
                    </Then>

                    <Else>
                        <div className="img-title">
                            <h4>{ title }</h4>

                            <button title="Haz click para editar" type="button" onClick={ onClick }>
                                <PencilIcon />
                            </button>
                        </div>  
                    </Else>
                </If>

                <h3>{ text }</h3>
            </div>
        </div>
    );
}