import { useAppDispatch } from '../../../features/store';

import { setPrivacyText } from '../../../features/auth';
import { hideSidebarMove, showSidebarMove } from '../../../features/ui';

import useAuth from '../../../hooks/useAuth';

import { PrivacyAction } from '../PrivacyAction';

import { SideBarMoveType } from '../../../interfaces/ui';

import './privacy.scss';

type Option = 'lastConnection' | 'profilePhoto' | 'info' | 'groups';

export const Privacy = () => {
    const dispatch = useAppDispatch();

    const { user: { settings, blockedUsers } } = useAuth();

    const handleShowSideBarMove = (sidebarMoveType: SideBarMoveType, text: string) => {
        dispatch(hideSidebarMove());

        setTimeout(() => {
            dispatch(showSidebarMove({ sidebarMoveType }))
            dispatch(setPrivacyText({ text }));
        }, 400);
    }

    const handleGetPrivacyOptionValue = (option: Option) => {
        const valueOption = settings?.privacy[option] || 'all';

        if (valueOption === 'all') return 'todos';
        else if (valueOption === 'contacts') return 'Mis contactos';
        else return 'Nadie'
    }

    return (
        <div className="privacy">
            <div className="privacy__personal-info">
                <h2>Quién puede ver mi información personal</h2>

                <div className="personal-info">
                    <PrivacyAction 
                        onClick={ () => handleShowSideBarMove('lastConnection', 'Si no muestras la hora de últ. vez no podras ver la hora de últ. vez de otras personas') }
                        text="Hora de últ. vez"
                        subText={ handleGetPrivacyOptionValue('lastConnection') }
                    />

                    <PrivacyAction
                        onClick={ () => handleShowSideBarMove('profilePhoto', 'Quién puede ver mi foto del perfil') }
                        text="Foto de perfil"
                        subText={ handleGetPrivacyOptionValue('profilePhoto') }
                    />

                    <PrivacyAction
                        onClick={ () => handleShowSideBarMove('info', 'Quién puede ver mi info.') }
                        text="Info."
                        subText={ handleGetPrivacyOptionValue('info') }
                    />
                </div>
            </div>

            <div className="privacy__personal-info-others">
                <PrivacyAction
                    onClick={ () => handleShowSideBarMove('groups', 'Quién puede ver grupos en común') }
                    text="Grupos"
                    subText={ handleGetPrivacyOptionValue('groups') }
                />

                <PrivacyAction
                    onClick={ () => handleShowSideBarMove('contacts-blocked', 'Los contactos bloqueados no podran enviarte mensajes') }
                    text="Contactos bloqueados"
                    subText={ (blockedUsers?.length === 0) ? 'Ninguno' : blockedUsers?.length?.toString() || '' }
                />
            </div>
        </div>
    );
}
