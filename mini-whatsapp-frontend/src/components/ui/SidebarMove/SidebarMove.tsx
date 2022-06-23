import { useEffect, useRef } from 'react';
import { If } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../../features/store';

import { removePrivacyText, removeSelectedContacts } from '../../../features/auth';
import { hideSidebarMove } from '../../../features/ui';

import { useAuth, useUi } from '../../../hooks';

import { ArrowBackIcon } from '../../../utils/icons';
import { sideBarMove } from '../../../utils/constants';

import './sidebar-move.scss';

export const SidebarMove = () => {
    const dispatch = useAppDispatch();
    const { selectedContacts, privacyText } = useAuth();
    const { showSideBarMove, sideBarMoveType } = useUi();

    const mounted = useRef(true);

    const { title, component: SideBarMoveComponent } = sideBarMove[sideBarMoveType];

    const sideBarMoveCondition = () => { 
        return  showSideBarMove 
            && sideBarMoveType !== 'contact-info' 
            && sideBarMoveType !== 'message-info'
            && sideBarMoveType !== 'group-info'
    }

    const handleHideSiderbarMove = () => {
        if (selectedContacts?.length > 0) dispatch(removeSelectedContacts());
        if (privacyText?.length > 0) dispatch(removePrivacyText());
        dispatch(hideSidebarMove());
    }

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        }
    }, []);

    return (
        <div 
            className={ (!!sideBarMoveCondition()) ? 'sidebar-move show-sidebar-move' : 'sidebar-move' }
        >
            <div className="block"></div>

            <div className="title">
                <button onClick={ handleHideSiderbarMove }>
                    <ArrowBackIcon />
                </button>

                <h3>{ title }</h3>
            </div>

            <If condition={ !!sideBarMoveCondition() }>
                <SideBarMoveComponent />
            </If>
        </div>
    );
}