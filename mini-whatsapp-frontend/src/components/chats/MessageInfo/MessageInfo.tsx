import { useUnmount } from 'react-use';
import { If } from '@anissoft/react-conditions';
import dayjs from 'dayjs';

import { useAppDispatch } from '../../../features/store';

import { resetMessageSelected } from '../../../features/chat';

import { useAuth, useChat } from '../../../hooks';

import { MessageResponse } from '../MessageResponse';

import { handleGetUsername } from '../../../utils/functions';

import './message-info.scss';

export const MessageInfo = () => {
    const dispatch = useAppDispatch();

    const { contacts, user: { settings } } = useAuth();
    const { messageSelected, chatSelected: { users } } = useChat();

    const handleFormatDate = (date: Date) => {
        return dayjs(date).format('DD/MM/YYYY') + ' a la(s) ' + dayjs(date).format('h:mm a');
    }

    useUnmount(() => dispatch(resetMessageSelected()));

    return (
        <div className="message-info">
            <div 
                className="message-info__container"
                style={{
                    backgroundImage: `url(${ settings?.background.backgroundSelected })`
                }}
            >
                <div 
                    className="message"
                    style={ (messageSelected.src?.image || messageSelected.src?.gif) ? { width: 306 } : undefined }
                >
                    <If condition={ !!messageSelected.responseTo?._id }>
                        <MessageResponse 
                            content={ messageSelected.responseTo?.content || '' }
                            image={ messageSelected.src?.image || messageSelected.src?.gif }
                            imageSize={ 65 }
                            userId={ messageSelected.responseTo?.user || '' }
                            userName={ handleGetUsername(messageSelected.responseTo?.user || '', users, contacts) || '' }
                        />
                    </If>

                    <If condition={ !!messageSelected?.src?.image || !!messageSelected.src?.gif }>
                        <div className="image">
                            <img 
                                loading="lazy" 
                                src={ messageSelected.src?.image || messageSelected.src?.gif } 
                                alt="" 
                            />
                        </div>
                    </If>

                    <div
                        className={ 
                            ((messageSelected.src?.image || messageSelected.src?.gif) && !messageSelected.content) 
                                ? 'content content-image' 
                                : 'content'
                        }
                    >
                        <p>{ messageSelected.content }</p>
                        <small>{ dayjs(messageSelected.createdAt).format('h:mm a') }</small>
                    </div>
                </div>
            </div>

            <div className="message-info__data">
                <div className="data">
                    <h3>Leído</h3>
                    <p>{ handleFormatDate(messageSelected?.updatedAt) }</p>
                </div>

                <div className="data">
                    <h3>Entregado</h3>
                    <p>{ handleFormatDate(messageSelected.createdAt) }</p>
                </div>
            </div>
        </div>
    );
}