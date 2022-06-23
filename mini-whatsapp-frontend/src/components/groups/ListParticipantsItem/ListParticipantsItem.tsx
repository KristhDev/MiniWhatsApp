import { If } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { removeSelectedContact, setSelectedContact } from '../../../features/auth';

import { useAuth } from '../../../hooks';

import { Contact } from '../../../interfaces/auth';

import userDefault from '../../../assets/images/default-user.jpg';

import './list-participants-item.scss';

interface ListParticipantsItemProps {
    contact: Contact
}

export const ListParticipantsItem = ({ contact }: ListParticipantsItemProps) => {
    const dispatch = useAppDispatch();

    const { selectedContacts } = useAuth();

    const handleSelectParticipant = () => {
        (selectedContacts?.includes(contact.id || ''))
            ? dispatch(removeSelectedContact({ contactId: contact.contact?._id || '' }))
            : dispatch(setSelectedContact({ contactId: contact.contact?._id || '' }));
    }

    return (
        <div onClick={ handleSelectParticipant } className="list-participants-item">
            <div className="list-participants-item__image">
                <img 
                    src={ (contact.contact?.image) ? contact.contact.image : userDefault } 
                    alt={ contact.name } 
                    loading="lazy"
                />
            </div>

            <div className="list-participants-item__content">
                <span>{ contact.name }</span>

                <If condition={ !!contact?.contact?.description }>
                    <small>{ contact.contact?.description?.slice(0, 40) + '...' }</small>
                </If>
            </div>
        </div>
    );
}