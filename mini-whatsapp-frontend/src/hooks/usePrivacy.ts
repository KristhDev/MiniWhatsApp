import useAuth from './useAuth';

import { PrivacyOption } from '../interfaces/auth';

const usePrivacy = () => {
    const { user, chats } = useAuth();

    const showUserPrivacy = (privacyValue: PrivacyOption, userId: string) => {
        if (user.id === userId || privacyValue === 'all') return true;
        if (privacyValue === 'nobody') return false;

        if (privacyValue === 'contacts') {
            const chat = chats.find(c => (c.users.length === 1 && c.users.includes(userId)));

            return !!chat;
        }

        return false;
    }

    const showLastConnection = (privacyValue: PrivacyOption, userId: string) => {
        const authPrivacyLastConnection = user.settings?.privacy?.lastConnection || 'all';

        if (authPrivacyLastConnection === 'nobody' || privacyValue === 'nobody') return false;
        if (privacyValue === 'all') return true;

        
        if (privacyValue === 'contacts') {
            const chat = chats.find(c => (c.users.length === 1 && c.users.includes(userId)));

            return !!chat;
        }

        return false;
    }

    return {
        showUserPrivacy,
        showLastConnection
    }
}

export default usePrivacy;