import { If } from '@anissoft/react-conditions';

import { useAuth, useChat } from '../../../hooks';

import { MessageResponseProps } from './interfaces';

import './message-response.scss';

export const MessageResponse = ({ content, image, imageSize, userName, userId }: MessageResponseProps) => {
    const { user } = useAuth();
    const { chatSelected: { usersColors } } = useChat();

    const userColor = usersColors.find(uc => uc.userId === userId)?.color || '#8FD0D5';

    return (
        <div 
            className="message-reponse"
            style={{ borderLeft: `5px solid ${ userColor }` }}
        >
            <div className="message-reponse__content">
                <b style={{ color: userColor }}>
                    { (userId === user.id) ? 'Tú' : userName  }
                </b>
                <p>{ content.slice(0, 160) }</p>
            </div>

            <If condition={ !!image }>
                <div 
                    className="message-reponse__image" 
                    style={{ height: imageSize, width: imageSize }}
                >
                    <img src={ image } alt="" />
                </div>
            </If>
        </div>
    );
}