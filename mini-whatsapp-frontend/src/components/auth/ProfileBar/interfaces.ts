import { User } from '../../../interfaces/auth';

export type ProfileBarProps = {
    showUserInfo?: boolean,
    user: User,
    isGroup: boolean,
}