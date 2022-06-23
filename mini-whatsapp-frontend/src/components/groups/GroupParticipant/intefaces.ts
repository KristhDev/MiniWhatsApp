import { User } from '../../../interfaces/auth';

export interface GroupParticipantProps {
    participant?: User;
    authId?: string;
    isAdmin?: boolean;
    admins?: string[];
    isGroup?: boolean;
    showContextMenu?: boolean;
    convertToBtn?: boolean;
    btnText?: string;
    onClick: () => void;
}
