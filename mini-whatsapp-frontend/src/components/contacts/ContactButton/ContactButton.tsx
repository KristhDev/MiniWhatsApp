import { BlockIcon, BlockUserIcon, LeaveIcon, TrashIcon } from '../../../utils/icons';

import { ContactButtonProps } from './interfaces';

import './contact-button.scss';

const icons = {
    block: BlockIcon,
    unblock: BlockIcon,
    blockuser: BlockUserIcon,
    trash: TrashIcon,
    leave: LeaveIcon
}

export const ContactButton = ({ icon, text, action }: ContactButtonProps) => {
    const Icon = icons[icon];

    return (
        <div 
            className="contact-button" 
            onClick={ action }
            title={ text }
        >
            <Icon />

            <p>{ text }</p>
        </div>
    );
}   