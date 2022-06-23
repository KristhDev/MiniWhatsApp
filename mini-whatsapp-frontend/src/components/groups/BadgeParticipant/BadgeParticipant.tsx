import { useAppDispatch } from '../../../features/store';

import { removeSelectedContact } from '../../../features/auth';

import { Contact } from '../../../interfaces/auth';

import { CancelIcon } from '../../../utils/icons';
import userDefault from '../../../assets/images/default-user.jpg';

import './badge-participant.scss';

interface BadgeParticipantProps {
    participant: Contact;
}

export const BadgeParticipant = ({ participant }: BadgeParticipantProps) => {
    const dispatch = useAppDispatch();

    const handleRemoveParticipant = () => { 
        dispatch(removeSelectedContact({ contactId: participant?.contact?._id || '' }));
    }

    return (
        <div className="badge-participant">
            <div className="img-participant">
                <img 
                    src={ (participant?.contact?.image) ? participant?.contact?.image : userDefault } 
                    alt={ participant?.name }
                    loading="lazy"
                />
            </div>

            <div className="content-participant">
                <p>{ participant?.name }</p>

                <button onClick={ handleRemoveParticipant }>
                    <CancelIcon />
                </button>
            </div>
        </div>
    );
}