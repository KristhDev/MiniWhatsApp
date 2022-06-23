export interface UpdateUserPrivacyPayload {
    lastConnection?: string;
    profilePhoto?: string;
    info?: string;
    groups?: string;
}

export interface NewBgChatPayload {
    backgrounds: string[];
    newBackground: File;
}

export interface SetBackgroundSelected {
    backgroundSelected: string;
    backgrounds: string[];
}

export interface RemoveBgChatPayload {
    background: string;
    bgDefault: string;
}

export interface SendMessagePayload {
    message: string;
    chatSelected: {
        id: string;
        respMsgId: string;
        destinations: string[];
    }
}

export interface SendMessageImagePayload {
    userId: string;
    chatId: string;
    message: string;
    destinations: string[];
    images: File[];
}

export interface SendMessageGifPayload {
    chatId: string;
    destinations: string[];
    gif: string;
    userId: string;
}

export interface ResendMessagesPayload {
    contentOfMessages: {
        content?: string;
        src?: {
            image?: string;
            gif?: string;
        }
    }[];
    chatsIds: string[];
    recipients: string[];
    userId: string;
}

export interface ReadNotificationsPayload {
    notfsIds: string[];
}

export interface GetChatPayload {
    id: string;
}

export interface GetMoreMessagesPayload {
    chatId: string;
    page: number;
}

export interface DeleteChatPayload {
    chatId: string;
}

export interface CleanChatForMePayload extends DeleteChatPayload {}

export interface DeleteMessagesPayload {
    usersIds: string[];
    messagesIds: string[];
    chatId: string;
}

export interface CreateGroupPayload {
    name: string;
    usersIds: string[];
    usersPhones: string[];
    image?: File;
}

export interface AddParticipantToGroupPayload {
    groupId: string;
    usersIds: string[];
}

export interface EditGroupPayload {
    chatId: string;
    data: {
        name?: string;
        description?: string;
        image?: File;
    }
}

export interface RemoveUserGroupPayload {
    chatId: string;
    userId: string;
}

export interface AppointAsAdminPayload extends RemoveUserGroupPayload {}

export interface RemoveAdminGroupPayload extends RemoveUserGroupPayload {}

export interface AssignCreatorToGroupPayload {
    groupId: string;
    newCreatorId: string;
}

export interface BlockedUserPayload {
    userId: string;
    destinations: string[];
}

export interface UnBlockedUserPayload extends BlockedUserPayload {}

export interface RemoveUserPhotoPayload {
    userId: string;
}

export interface RemoveGroupPhotoPayload {
    groupId: string;
}