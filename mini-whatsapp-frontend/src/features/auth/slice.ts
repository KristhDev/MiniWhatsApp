import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { 
    AuthState,
    AddContactPayload, 
    SetBlockedUserPayload,
    AddContactBlockedUserPayload,
    RemovedChatPayload, 
    SetChatPayload, 
    UpdatedContactPayload,
    SetOnlineContactUserPayload,
    RemovedChatNotificationsPayload,
    SetSelectedContactsPayload,
    UpdateChatPayload,
    UserLoginPayload,
    RemovedUserOfMyChatsPayload,
    SetImageGroupToChatPayload,
    ReplaceCreatorOfMyChatsPayload,
    RemoveGroupPhotoPayload,
    UpdateUserSettingsPayload,
    UpdateSettingOfContactPayload,
    SetPrivacyTextPayload
} from '../../interfaces/auth';
import { AddAdminToMyChatsPayload, RemoveAdminToMyChatsPayload } from '../../interfaces/chat';

import { startRegister, startLogin, startRenewAuth, startUpdatingUser } from './thunks';  

const INITIAL_STATE: AuthState = {
    user: {},
    contacts: [],
    selectedContacts: [],
    chats: [],
    isAuthLoading: false,
    privacyText: ''
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: INITIAL_STATE,
    reducers: {
        userLogin: (state: AuthState, action: PayloadAction<UserLoginPayload>) => {
            state.user = { ...action.payload.user };
            state.contacts = [ ...action.payload.contacts ];
            state.chats = [ ...action.payload.chats ];
        },

        userLogOut: () => {
            return { ...INITIAL_STATE }
        },

        removePhoto: (state: AuthState) => {
            state.user = {
                ...state.user,
                image: undefined
            }
        },

        addContact: (state: AuthState, action: PayloadAction<AddContactPayload>) => {
            state.contacts = [ action.payload.contact, ...state.contacts ];
        },

        updateContact: (state: AuthState, action: PayloadAction<UpdatedContactPayload>) => {
            state.contacts = state.contacts.map(
                c => (c.id === action.payload.contact.id) ? { ...action.payload.contact } : c
            );
        },

        addChat: (state: AuthState, action: PayloadAction<SetChatPayload>) => {
            const chatExists = state.chats.find(c => c.id === action.payload.chat.id);

            if (!chatExists) {
                state.chats = [ action.payload.chat, ...state.chats ];
            }
            else {
                state.chats = state.chats.map(
                    c => (c.id === action.payload.chat.id) 
                        ? { ...action.payload.chat } 
                        : c
                );
            }
        },

        setChat: (state: AuthState, action: PayloadAction<SetChatPayload>) => {
            state.chats = state.chats.map(
                c => {
                    if (c.id === action.payload.chat.id)  {
                        const ntfs = [ ...c.notifications, ...action.payload.chat.notifications ];

                        let set = new Set(ntfs.map(n => JSON.stringify(n)));
                        let newArr = Array.from(set).map(n => JSON.parse(n));

                        return {
                            ...action.payload.chat, 
                            notifications: [ ...newArr ] 
                        }
                    }
                    else return c;
                } 
            );

            const chat = state.chats.find(c => c.id === action.payload.chat.id);
            const otherChats = state.chats.filter(c => c.id !== action.payload.chat.id);

            if (chat) state.chats = [ chat, ...otherChats ];
        },

        updateChat: (state: AuthState, action: PayloadAction<UpdateChatPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId) ? { ...c, ...action.payload.data } : c
            );
        },

        setImageGroupToChat: (state: AuthState, action: PayloadAction<SetImageGroupToChatPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId) ? { ...c, image: action.payload.image } : c
            );
        },

        removeChat: (state: AuthState, action: PayloadAction<RemovedChatPayload>) => {
            state.chats = state.chats.filter(c => c.id !== action.payload.chatId);
        },

        replaceCreatorOfMyChats: (state: AuthState, action: PayloadAction<ReplaceCreatorOfMyChatsPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId)
                    ? { 
                        ...c, 
                        creator: action.payload.creatorId,
                        admins: c.admins?.includes(action.payload.creatorId) 
                        ? c.admins 
                        : [ ...c?.admins || [], action.payload.creatorId ]
                    }
                    : c
            )
        },

        addAdminToMyChats: (state: AuthState, action: PayloadAction<AddAdminToMyChatsPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId) 
                    ? { 
                        ...c, 
                        admins: (c?.admins && c?.admins.length > 0) ? [ ...c?.admins, action.payload.userId ] : [] 
                    } 
                    : c
            );
        },

        removeAdminToMyChats: (state: AuthState, action: PayloadAction<RemoveAdminToMyChatsPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId)
                    ? {
                        ...c,
                        admins: (c?.admins && c?.admins.length > 0) ? c.admins.filter(a => a !== action.payload.userId) : []
                    }
                    : c
            );
        },

        addUserToMyChats: (state: AuthState, action: PayloadAction<RemovedUserOfMyChatsPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId) 
                    ? { 
                        ...c, 
                        users: c.users.includes(action.payload.userId) 
                            ? c.users 
                            : [ ...c.users, action.payload.userId ],
                        removedFor: c.removedFor.filter(u => u !== action.payload.userId) 
                    } 
                    : c
            );
        },

        removeUserOfMyChats: (state: AuthState, action: PayloadAction<RemovedUserOfMyChatsPayload>) => {
            state.chats = state.chats.map(
                c => c.id === action.payload.chatId 
                    ? { 
                        ...c, 
                        users: c.users.filter(u => u !== action.payload.userId), 
                        removedFor: [ ...c.removedFor, action.payload.userId ] 
                    } 
                    : c
            )
        },

        removeGroupPhoto: (state: AuthState, action: PayloadAction<RemoveGroupPhotoPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId)
                    ? { ...c, image: undefined }
                    : c
            );
        },

        removeChatNotifications: (state: AuthState, action: PayloadAction<RemovedChatNotificationsPayload>) => {
            state.chats = state.chats.map(
                c => (c.id === action.payload.chatId) ? { ...c, notifications: [] } : c
            );
        },

        setBlockedUser: (state: AuthState, action: PayloadAction<SetBlockedUserPayload>) => {
            state.user.blockedUsers = [ ...action.payload.blockedUsers ];
        },

        addContactBlockedUsers: (state: AuthState, action: PayloadAction<AddContactBlockedUserPayload>) => {
            state.contacts = state.contacts.map(
                c => (c.contact?._id === action.payload.userId) 
                    ? { ...c, contact: { ...c.contact, blockedUsers: action.payload.blockedUsers } } 
                    : c
            );
        },

        setOnlineContactUser: (state: AuthState, action: PayloadAction<SetOnlineContactUserPayload>) => {
            state.contacts = state.contacts.map(
                c => (c.contact?._id === action.payload.userId)
                    ? { 
                        ...c, 
                        contact: { 
                            ...c.contact, 
                            online: action.payload.online, 
                            lastConnection: action.payload.lastConnection 
                        } 
                    }
                    : c
            )
        },

        updateUserSettings: (state: AuthState, action: PayloadAction<UpdateUserSettingsPayload>) => {
            state.user = {
                ...state.user,
                settings: action.payload.settings
            }
        },

        setSelectedContact: (state: AuthState, action: PayloadAction<SetSelectedContactsPayload>) => {
            state.selectedContacts = [ action.payload.contactId, ...state.selectedContacts ];
        },

        removeSelectedContact: (state: AuthState, action: PayloadAction<SetSelectedContactsPayload>) => {
            state.selectedContacts = state.selectedContacts.filter(c => c !== action.payload.contactId);
        },

        removeSelectedContacts: (state: AuthState) => {
            state.selectedContacts = [];
        },

        updateSettingOfContact: (state: AuthState, action: PayloadAction<UpdateSettingOfContactPayload>) => {
            state.contacts = state.contacts.map(
                c => (c.contact?._id === action.payload.settings.user)
                    ? {
                        ...c,
                        contact: {
                            ...c.contact,
                            settings: action.payload.settings
                        }
                    }
                : c
            );
        },

        toggleIsAuthLoading: (state: AuthState) => {
            state.isAuthLoading = !state.isAuthLoading;
        },

        setPrivacyText: (state: AuthState, action: PayloadAction<SetPrivacyTextPayload>) => {
            state.privacyText = action.payload.text;
        },

        removePrivacyText: (state: AuthState) => {
            state.privacyText = '';
        }
    },
    extraReducers: (builder) => {
        builder.addCase(startRegister.pending, (state) => {
            state.isAuthLoading = true;
        })

        .addCase(startRegister.rejected, (state) => {
            state.isAuthLoading = false;
        })

        .addCase(startRegister.fulfilled, (state) => {
            state.isAuthLoading = false;
        })

        .addCase(startLogin.pending, (state) => {
            state.isAuthLoading = true;
        })

        .addCase(startLogin.rejected, (state) => {
            state.isAuthLoading = false;
        })

        .addCase(startLogin.fulfilled, (state) => {
            state.isAuthLoading = false;
        })

        .addCase(startRenewAuth.pending, (state) => {
            state.isAuthLoading = true;
        })

        .addCase(startRenewAuth.rejected, (state) => {
            state.isAuthLoading = false;
        })

        .addCase(startRenewAuth.fulfilled, (state) => {
            state.isAuthLoading = false;
        })

        .addCase(startUpdatingUser.fulfilled, (state, action) => {
            if (action.payload) state.user = { ...action.payload.user };
        });
    }
});

export const { 
    userLogin,
    userLogOut,
    removePhoto,
    addContact,
    updateContact,
    addChat,
    updateChat,
    setImageGroupToChat,
    setChat,
    removeChat,
    replaceCreatorOfMyChats,
    addAdminToMyChats,
    removeAdminToMyChats,
    addUserToMyChats,
    removeUserOfMyChats,
    removeGroupPhoto,
    removeChatNotifications,
    setBlockedUser,
    addContactBlockedUsers,
    setOnlineContactUser,
    updateUserSettings,
    updateSettingOfContact,
    setSelectedContact,
    removeSelectedContact,
    removeSelectedContacts,
    toggleIsAuthLoading,
    setPrivacyText,
    removePrivacyText
} = authSlice.actions;

export default authSlice.reducer;