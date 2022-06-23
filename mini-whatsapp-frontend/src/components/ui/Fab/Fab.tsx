import { ImageIcon } from "../../../utils/icons";

import './fab.scss';

interface FabProps {
    onClick: () => void;
    icon: 'image';
    color: string;
    showButton: boolean;
    style?: StyleSheet;
}

const icons = {
    'image': ImageIcon
}

export const Fab = ({ onClick, icon, color, style, showButton }: FabProps) => {
    const Icon = icons[icon];

    return (
        <button 
            className={ (showButton) ? 'fab show-fab' : 'fab' }
            style={{ background: color, ...style }} 
            onClick={ onClick } 
            type="button"
        >
            <Icon />
        </button>
    );
}
