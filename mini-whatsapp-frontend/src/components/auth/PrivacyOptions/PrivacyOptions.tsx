import { useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { useAuth, useSocket, useUi } from '../../../hooks';

import { PrivacyOption } from '../../../interfaces/auth';

import './privacy-options.scss';

export const PrivacyOptions = () => {
    const socket = useSocket();

    const { user: { settings }, privacyText } = useAuth();
    const { sideBarMoveType } = useUi();

    const handlePrivacyOption= () => {
        if (settings && (sideBarMoveType === 'info' || sideBarMoveType === 'groups' || sideBarMoveType === 'lastConnection' || sideBarMoveType === 'profilePhoto')) {
            return settings.privacy[sideBarMoveType];
        }

        return 'all';
    }

    const privacyOptionSelected = handlePrivacyOption();

    const [ privacyOption, setPrivacyOption ] = useState<PrivacyOption>(privacyOptionSelected);

    useUpdateEffect(() => {
        const newSettings = {
            ...settings?.privacy,
            [sideBarMoveType]: privacyOption
        }

        socket.emit('miniwass-update-user-privacy', newSettings);
    }, [ privacyOption ]);

    return (
        <div className="privacy-options">
            <div className="privacy-options__description">
                <p>{ privacyText }</p>
            </div>

            <div className="privacy-options__options">
                <div className="privacy-option">
                    <label>
                        <input 
                            checked={ privacyOption === 'all' }
                            name={ sideBarMoveType } 
                            onChange={ () => setPrivacyOption('all') }
                            type="radio"
                        />
                        <span>Todos</span>
                    </label>
                </div>

                <div className="privacy-option">
                    <label>
                        <input 
                            checked={ privacyOption === 'contacts' }
                            name={ sideBarMoveType } 
                            onChange={ () => setPrivacyOption('contacts') }
                            type="radio" 
                        />
                        <span>Mis contactos</span>
                    </label>
                </div>

                <div className="privacy-option">
                    <label>
                        <input 
                            checked={ privacyOption === 'nobody' }
                            name={ sideBarMoveType } 
                            onChange={ () => setPrivacyOption('nobody') }
                            type="radio" 
                        />
                        <span>Nadie</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
