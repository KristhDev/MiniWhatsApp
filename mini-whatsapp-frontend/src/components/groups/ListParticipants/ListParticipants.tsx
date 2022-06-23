import { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { If } from '@anissoft/react-conditions';
import { For } from 'react-loops';

import { useAppDispatch } from '../../../features/store';

import { hideSidebarMove, showSidebarMove } from '../../../features/ui';

import { useAuth, useDebounce, usePrivacy } from '../../../hooks';

import { BadgeParticipant } from '../BadgeParticipant';
import { ListParticipantsItem } from '../ListParticipantsItem';

import { Contact } from '../../../interfaces/auth';
import { SideBarMoveType } from '../../../interfaces/ui';

import { ArrowBackIcon } from '../../../utils/icons';

import userDefault from '../../../assets/images/default-user.jpg';

import './list-participants.scss';

export const ListParticipants = () => {
    const dispatch = useAppDispatch();

    const { contacts, selectedContacts } = useAuth();
    const { showUserPrivacy } = usePrivacy();

    const contactsMaped = contacts.map(c => ({
        ...c,
        contact: {
            ...c?.contact,
            image: (showUserPrivacy(c?.contact?.settings?.privacy?.profilePhoto || 'all', c?.contact?._id || '')) 
                ? c?.contact?.image || userDefault
                : userDefault,
            description: (showUserPrivacy(c?.contact?.settings?.privacy?.info || 'all', c?.contact?._id || ''))
                ? c?.contact?.description
                : '',
        }
    }));

    const [ searchContacts, setSearchContacts ] = useState<Contact[]>(contactsMaped);

    const [ searchStringContacts, setSearchStringContacts ] = useState<string>('');
    const debounceStringContacts = useDebounce(searchStringContacts, 500);

    const selectedContactsComp = contacts.filter(c => selectedContacts.includes(c.contact?._id || ''));

    const handleMoveToSidebarGroup = (type: SideBarMoveType) => {
        dispatch(hideSidebarMove());

        setTimeout(() => {
            dispatch(showSidebarMove({ sidebarMoveType: type }));
        }, 200);
    } 

    useUpdateEffect(() => {
        if (debounceStringContacts) {
            setSearchContacts(contactsMaped.filter(
                c => c.name?.toLowerCase().includes(debounceStringContacts.toLowerCase())
            ));
        }
        else setSearchContacts(contactsMaped);
    }, [ debounceStringContacts ]);

    return (
        <div className="list-participants">
            <If condition={ selectedContactsComp?.length > 0 }>
                <div className="add-participants">
                    <For 
                        of={ selectedContactsComp }
                        as={ (contact, { key }) => (
                            <BadgeParticipant 
                                key={ contact?.id || '' + key } 
                                participant={ contact } 
                            />
                        ) }
                    />
                </div>
            </If>

            <div 
                className={ 
                    (selectedContactsComp?.length > 0) ? 'contacts-search contacts-search__not-pt' : 'contacts-search' 
                } 
            >
                <input 
                    onChange={ e => setSearchStringContacts(e.target.value) }
                    placeholder="Escribe el nombre del contacto" 
                    type="text" 
                    value={ searchStringContacts }
                />
            </div>

            <div className="contacts-list">
                <For 
                    of={ searchContacts }
                    as={ (contact, { key }) => (
                        <If condition={ !selectedContacts?.includes(contact.contact?._id || '') }>
                            <ListParticipantsItem 
                                key={ `${ contact?.id || '' + contact?.chat || '' + key }` } 
                                contact={ contact } 
                            />
                        </If>
                    ) }
                />
            </div>

            <div className={ (selectedContacts?.length > 0) ? 'btn-container show-btn' : 'btn-container' }>
                <button onClick={ () => handleMoveToSidebarGroup('new-group') }>
                    <ArrowBackIcon />
                </button>
            </div>
        </div>
    );
}