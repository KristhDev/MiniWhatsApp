import { MouseEvent, useState } from 'react';
import { contextMenu, Item, Menu } from 'react-contexify';
import { Else, If, Then } from '@anissoft/react-conditions';

import { useActions, useAuth, useChat } from '../../../hooks';

import { handleGetUserImage, handleGetUsername } from '../../../utils/functions';
import { AddUserIcon, ArrowDownIcon } from '../../../utils/icons';

import { GroupParticipantProps } from './intefaces';

import './group-participant.scss';

export const GroupParticipant = ({ participant, authId, isAdmin, admins, convertToBtn = false, btnText, onClick, isGroup = false, showContextMenu = true }: GroupParticipantProps) => {
    const [ isDisabled, setIsDisabled ] = useState<boolean>(false);

    const { contacts } = useAuth();
    const { chatSelected: { users, createdBy } } = useChat();

    const { startLeaveOfGroup, startAppointAsAdmin, startRemoveAdmin } = useActions();

    const handleOnClick = () => !isDisabled && onClick();

    const handleToggleParticipantOptions = (e: MouseEvent) => {
        setIsDisabled(!isDisabled);
        e.stopPropagation();

        contextMenu.show({
            id: `group-participant-options-${ participant?.id || 0 }`,
            event: e,
            position: {
                x: e.clientX - 250,
                y: e.clientY + 10,
            }
        });
    }

    const handleDescriptionFormat = (description: string) => {
        return (description?.length > 40) 
            ? description?.slice(0, 40) + '...' 
            : description;
    }

    const handleAppointAsAdmin = () => {
        startAppointAsAdmin(participant?.id || '', admins || []);
    }

    const handleRemoveAdmin = () => {
        startRemoveAdmin(participant?.id || '', createdBy);
    }

    const handleDeleteParticipant = () => {
        startLeaveOfGroup(participant?.id || '', admins || []);
        setIsDisabled(!isDisabled);
    }

    return (
        <div className="group-participant" onClick={ handleOnClick }>
            <div className="img-participant">
                <If condition={ !convertToBtn }>
                    <Then>
                        <img 
                            src={ handleGetUserImage(participant?.image || '', isGroup) }
                            alt={ participant?.name }
                            loading="lazy"
                        />
                    </Then>

                    <Else>
                        <div className="img-btn">
                            <AddUserIcon />
                        </div>
                    </Else>
                </If>
            </div>

            <div 
                className={ (convertToBtn) ? 'info-participant info-participant-center' : 'info-participant'}
            >
                <div className="name">
                    <If condition={ !convertToBtn }>
                        <Then>
                            <span>
                                { 
                                    (participant?.id === authId) 
                                        ? 'Tú' 
                                        : handleGetUsername(participant?.id || '', users, contacts) || participant?.name
                                }
                            </span>

                            <If condition={ !!isAdmin }>
                                <small>Admin. del grupo</small>
                            </If>
                        </Then>

                        <Else>
                            <span>{ btnText }</span>
                        </Else>
                    </If>
                </div>

                <small>{ handleDescriptionFormat(participant?.description || '') }</small>

                <If 
                    condition={ 
                        !convertToBtn && 
                            (
                                (participant?.id === authId) 
                                ? (!!admins?.includes(authId || '') && !admins?.includes(participant?.id || ''))
                                : (createdBy !== participant?.id && !!admins?.includes(authId || ''))
                            )
                    }
                >
                    <If condition={ showContextMenu }>
                        <button 
                            className="btn-options"
                            onClick={ handleToggleParticipantOptions }
                            onContextMenu={ handleToggleParticipantOptions }
                        >
                            <ArrowDownIcon />
                        </button>
                    </If>
                </If>
            </div>

            <Menu 
                className="react-contexify__scale-right-group-participant" 
                id={ `group-participant-options-${ participant?.id || 0 }` }
                style={{ right: '25px' }}
            >
                <If condition={ !!admins?.includes(participant?.id || '') }>
                    <Then>
                        <Item onClick={ handleRemoveAdmin }>Quitar como admin. del grupo</Item>
                    </Then>

                    <Else>
                        <Item onClick={ handleAppointAsAdmin }>Designar como admin. del grupo</Item>
                    </Else>
                </If>

                <Item onClick={ handleDeleteParticipant }>Eliminar</Item>
            </Menu>
        </div>
    );
}