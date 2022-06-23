import { BackgroundIcon, HelpIcon, PadlockIcon } from '../../../utils/icons';

import './btn-action.scss';

interface BtnActionProps {
    onClick: () => void;
    text: string;
    icon: 'background' | 'padlock' | 'help';
}

const Icons = {
    background: <BackgroundIcon />,
    padlock: <PadlockIcon />,
    help: <HelpIcon />
}

export const BtnAction = ({ onClick, text, icon }: BtnActionProps) => {
    const Icon = () => Icons[icon];    

    return (
        <div 
            className="btn-action"
            onClick={ onClick } 
        >
            <Icon />

            <div className="btn-action__text">
                <p>{ text }</p>
            </div>
        </div>
    );
}
