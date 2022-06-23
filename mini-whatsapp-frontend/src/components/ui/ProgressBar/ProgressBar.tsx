import { useEffect, useState } from 'react';

import whatsAppLogo from '../../../assets/images/whatsapp-logo.png'
import './progress-bar.scss';

export const ProgressBar = () => {
    const [ progress, setProgress ] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setProgress(true);
        }, 100);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    return (
        <div className="progress-container">
            <div className="app-logo">
                <img 
                    loading="lazy" 
                    src={ whatsAppLogo } 
                    alt="app-logo" 
                />
            </div>

            <div className="progress-bar">
                <div className={ (progress) ? 'progress progress-full' : 'progress' }></div>
            </div>

            <h2 className="title-screen">Mini WhatsApp</h2>
        </div>
    );
}