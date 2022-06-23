import { useAppDispatch } from '../../../features/store';

import { hideSidebarMove, showSidebarMove } from '../../../features/ui';

import { useAuth } from '../../../hooks';

import { BtnAction } from '../../ui';

import { SideBarMoveType } from '../../../interfaces/ui';

import userDefault from '../../../assets/images/default-user.jpg'; 

import './user-settings.scss';

export const UserSettings = () => {
    const dispatch = useAppDispatch();

    const { user } = useAuth();

    const handleGoSideBarMoveType = (sidebarMoveType: SideBarMoveType) => {
        dispatch(hideSidebarMove());

        setTimeout(() => {
            dispatch(showSidebarMove({ sidebarMoveType }));
        }, 400);
    }

    return (
        <div className="user-settings">
            <div 
                className="user-settings__profile" 
                onClick={ () => handleGoSideBarMoveType('profile') }
            >
                <div className="profile-image">
                    <img 
                        src={ user?.image || userDefault } 
                        alt="user-profile" 
                    />
                </div>

                <div className="profile-info">
                    <h2>{ user?.username }</h2>
                    <p>{ user?.description }</p>
                </div>
            </div>

            <div className="user-settings__actions">
                <BtnAction 
                    onClick={ () => handleGoSideBarMoveType('privacy') }
                    text="Privacidad"
                    icon="padlock"
                />

                <BtnAction
                    onClick={ () => handleGoSideBarMoveType('background') }
                    text="Fondo de pantalla"
                    icon="background"
                />

                <BtnAction
                    onClick={ () => handleGoSideBarMoveType('help') }
                    text="Ayuda"
                    icon="help"
                />
            </div>
        </div>
    );
}