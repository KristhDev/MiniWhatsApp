import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import { 
    ChatState,
    AddMessagePayload,
    AddSelectedMessagePayload,
    SetChatHeightPayload,
    LoadMessagesPayload, 
    SetChatSelectedPayload,
    SetMessageSelectd,
    LoadMoreMessagesPayload,
    UpdatedUserOfChatSelectedPayload,
    AddBlockedUsersPayload,
    SetResponseMessagePayload,
    DeletingMessagesPayload,
    SetOnlineUserChatSelectedPayload,
    SetStartLoadMoreMessages,
    SetUsersInChatSelected,
    SetUsersColorsPayload,
    SetNameAndDescriptionPayload,
    RemoveUserOfChatPayload,
    SetSelectedUsersPayload,
    AddUserToChatSelectedPayload,
    RemovedSelectedMessagePayload,
    SetImagesToUploadPayload,
    AddImagesToUploadPayload,
    RemoveImageToUploadPayload,
    SetMessagesFilesPayload,
    RemoveChatFilePayload,
    AddChatFilePayload,
    ReplaceCreatorPayload,
    UpdateUserSettingsOfUserPayload
} from '../../interfaces/chat';

import { handleNoRepeatMessages, handleAddDayToMessages } from '../../utils/functions';

const INITIAL_STATE: ChatState = {
    messages: [],
    chatSelected: {
        id: '',
        name: '',
        destinations: [],
        description: '',
        height: 0,
        createdBy: '',
        isGroup: false,
        users: [],
        usersColors: [],
        files: []
    },
    messageSelected: {
        _id: '',
        user: '',
        chat: '',
        isResending: false,
        content: '',
        removedFor: [],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    responseMessage: '',
    isSelectedMessages: false,
    isRespMessage: false,
    startLoadMoreMessages: true,
    selectedMessages: [],
    selectedUsers: [],
    imagesPreviews: [],
    imagesFiles: [],
    isShowGifs: false
}

const chatSlice = createSlice({
    name: 'chats',
    initialState: INITIAL_STATE,
    reducers: {
        setChatSelected: (state: ChatState, action: PayloadAction<SetChatSelectedPayload>) => {
            state.chatSelected = { ...state.chatSelected, ...action.payload }
            state.startLoadMoreMessages = true;
        },

        resetChatSelected: (state: ChatState) => {
            state.messages = [];
            state.chatSelected = {
                height: 0,
                name: '',
                id: '',
                isGroup: false,
                createdBy: '',
                destinations: [],
                description: '',
                users: [],
                usersColors: [],
                files: []
            }
        },

        setChatHeight: (state: ChatState, action: PayloadAction<SetChatHeightPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                height: action.payload.chatHeight
            }
        },

        addUserToChatSelected: (state: ChatState, action: PayloadAction<AddUserToChatSelectedPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                destinations: [...state.chatSelected.destinations, action.payload.destination ],
                users: [ ...state.chatSelected.users, action.payload.user ],
                usersColors: [ 
                    ...state.chatSelected.usersColors, 
                    { userId: action.payload.user?.id || '', color: action.payload.userColor } 
                ]
            }
        },

        setUsersInChatSelected: (state: ChatState, action: PayloadAction<SetUsersInChatSelected>) => {
            state.chatSelected = {
                ...state.chatSelected,
                destinations: [ ...action.payload.destinations ],
                users: [ ...action.payload.users ]
            }
        },

        updateUserSettingsOfUser: (state: ChatState, action: PayloadAction<UpdateUserSettingsOfUserPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                users: state.chatSelected.users.map(
                    u => (u.id === action.payload.settings.user) 
                        ? { ...u, settings: action.payload.settings } 
                        : u
                )
            }
        },

        setUsersColors: (state: ChatState, action: PayloadAction<SetUsersColorsPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                usersColors: [ ...action.payload.usersColors ]
            }
        },

        removeUsersColors: (state: ChatState) => {
            state.chatSelected = {
                ...state.chatSelected,
                usersColors: []
            }
        },

        setNameAndDescription: (state: ChatState, action: PayloadAction<SetNameAndDescriptionPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                name: action.payload.name,
                description: action.payload.description
            }
        },

        removeUserOfChat: (state: ChatState, action: PayloadAction<RemoveUserOfChatPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                users: state.chatSelected.users.filter(u => u.id !== action.payload.userId),
                usersColors: state.chatSelected.usersColors.filter(uc => uc.userId !== action.payload.userId)
            }
        },

        addChatFile: (state: ChatState, action: PayloadAction<AddChatFilePayload>) => {
            const filesSet = new Set([ ...state.chatSelected.files, action.payload.file ].map(f => JSON.stringify(f)));

            state.chatSelected = {
                ...state.chatSelected,
                files: Array.from(filesSet).map(f => JSON.parse(f))
            }
        },

        setChatFiles: (state: ChatState, action: PayloadAction<SetMessagesFilesPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                files: [ ...action.payload.files ]
            }
        },

        removeChatFiles: (state: ChatState) => {
            state.chatSelected = {
                ...state.chatSelected,
                files: []
            }
        },

        removeChatFile: (state: ChatState, action: PayloadAction<RemoveChatFilePayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                files: state.chatSelected.files.filter(f => f._id !== action.payload.id)
            }
        },

        replaceCreator: (state: ChatState, action: PayloadAction<ReplaceCreatorPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                createdBy: action.payload.creatorId
            }
        },

        setMessageSelected: (state: ChatState, action: PayloadAction<SetMessageSelectd>) => {
            state.messageSelected = { ...action.payload.message }
        },

        resetMessageSelected: (state: ChatState) => {
            state.messageSelected = {
                _id: '',
                user: '',
                chat: '',
                isResending: false,
                content: '',
                removedFor: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        },

        loadMessages: (state: ChatState, action: PayloadAction<LoadMessagesPayload>) => {
            const messages = handleAddDayToMessages(action.payload.messages);

            state.messages = [ ...messages ];
        },

        loadMoreMessges: (state: ChatState, action: PayloadAction<LoadMoreMessagesPayload>) => {
            const messagesNotRepeat = handleNoRepeatMessages([ ...action.payload.messages, ...state.messages ]);
            const messagesWithDay = handleAddDayToMessages(messagesNotRepeat);
            const messagesWithDayNotRepeat = handleNoRepeatMessages(messagesWithDay);

            state.messages = [ ...messagesWithDayNotRepeat ];
            state.startLoadMoreMessages = true;
        },

        addMessage: (state: ChatState, action: PayloadAction<AddMessagePayload>) => {
            const messages = handleNoRepeatMessages([ ...state.messages, action.payload.message ]);
            const messagesWithDay = handleAddDayToMessages(messages);

            state.messages = [ ...messagesWithDay ];
        },

        deleteMessages: (state: ChatState, action: PayloadAction<DeletingMessagesPayload>) => {
            const messages = state.messages.filter(m => !(action.payload.ids.includes(m._id)));
            const messagesWithDay = handleAddDayToMessages(messages);

            state.messages = [ ...messagesWithDay ]
            state.selectedMessages = [];
        },

        deleteAllMessages:(state: ChatState) => {
            state.messages = [];
        },

        chatUserLogOut: () => {
            return { ...INITIAL_STATE }
        },

        updateUserOfChatSelected: (state: ChatState, action: PayloadAction<UpdatedUserOfChatSelectedPayload>) => {
            state.chatSelected.users = state.chatSelected.users.map(
                u => (u.id === action.payload.user.id) ? action.payload.user : u
            );
        },

        toggleIsSelectedMessages: (state: ChatState) => {
            state.isSelectedMessages = !state.isSelectedMessages;
        },

        toggleLoadMoreMessages: (state: ChatState) => {
            state.startLoadMoreMessages = !state.startLoadMoreMessages;
        },

        setStartLoadMoreMessages: (state: ChatState, action: PayloadAction<SetStartLoadMoreMessages>) => {
            state.startLoadMoreMessages = action.payload.startLoadMoreMessages;

            if (state.messages[0]?.user !== 'not-user') {
                state.messages = [ 
                    { 
                        ...state.messages[0], 
                        content:  dayjs(state.messages[0]?.createdAt).format('DD/MM/YYYY'),
                        user: 'not-user',
                        _id: dayjs(state.messages[0]?.createdAt).format('DD/MM/YYYY HH:mm:ss')
                    }, 
                    ...state.messages 
                ];
            }
        },

        addSelectedMessage: (state: ChatState, action: PayloadAction<AddSelectedMessagePayload>) => {
            state.selectedMessages = [ action.payload.id, ...state.selectedMessages ];
        },

        removeSelectedMessage: (state: ChatState, action: PayloadAction<RemovedSelectedMessagePayload>) => {
            state.selectedMessages = state.selectedMessages.filter(m => m !== action.payload.id)
        },

        removeSelectedMessages: (state: ChatState) => {
            state.selectedMessages = [];
        },

        setSelectedUsers: (state: ChatState, action: PayloadAction<SetSelectedUsersPayload>) => {
            state.selectedUsers = [ ...action.payload.usersIds ];
        },

        removeAllSelectedUsers: (state: ChatState) => {
            state.selectedUsers = [];
        },

        addBlockedUsers: (state: ChatState, action: PayloadAction<AddBlockedUsersPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                users: state.chatSelected.users.map(
                    u => (u.id === action.payload.userId)
                        ? { ...u, blockedUsers: action.payload.blockedUsers }
                        : u
                )
            }
        },

        setIsRespMessage: (state: ChatState) => {
            state.isRespMessage = true;
        },

        removeIsRespMessage: (state: ChatState) => {
            state.isRespMessage = false;
        },

        setResponseMessage: (state: ChatState, action: PayloadAction<SetResponseMessagePayload>) => {
            state.responseMessage = action.payload.respMsgId;
        },

        removeResponseMessage: (state: ChatState) => {
            state.responseMessage = '';
        },

        setOnlineUserChatSelected: (state: ChatState, action: PayloadAction<SetOnlineUserChatSelectedPayload>) => {
            state.chatSelected = {
                ...state.chatSelected,
                users: state.chatSelected.users.map(
                    u => (u.id === action.payload.userId)
                        ? { ...u, online: action.payload.online, lastConnection: action.payload.lastConnection }
                        : u
                )
            }
        },

        setImagesToUpload: (state: ChatState, action: PayloadAction<SetImagesToUploadPayload>) => {
            state.imagesPreviews = [ ...action.payload.imagesPreviews ];
            state.imagesFiles = [ ...action.payload.imagesFiles ];
        },

        addImagesToUpload: (state: ChatState, action: PayloadAction<AddImagesToUploadPayload>) => {
            state.imagesPreviews = [ ...state.imagesPreviews, ...action.payload.imagesPreviews ];
            state.imagesFiles = [ ...state.imagesFiles, ...action.payload.imagesFiles ];
        },

        removeImageToUpload: (state: ChatState, action: PayloadAction<RemoveImageToUploadPayload>) => {
            state.imagesPreviews = state.imagesPreviews.filter(
                (_, index) => index !== action.payload.index
            );

            state.imagesFiles = state.imagesFiles.filter(
                (_, index) => index !== action.payload.index
            );
        },

        removeAllImagesToUpload: (state: ChatState) => {
            state.imagesPreviews = [];
            state.imagesFiles = [];
        },

        toggleIsShowGifs: (state: ChatState) => {
            state.isShowGifs = !state.isShowGifs;
        },

        setIsShowGifs: (state: ChatState) => {
            state.isShowGifs = true;
        },

        removeIsShowGifs: (state: ChatState) => {
            state.isShowGifs = false;
        }
    }
});

export const { 
    setChatSelected,
    resetChatSelected,
    setMessageSelected,
    addUserToChatSelected,
    updateUserSettingsOfUser,
    setUsersInChatSelected,
    setUsersColors,
    removeUsersColors,
    setNameAndDescription,
    removeUserOfChat,
    setChatHeight,
    addChatFile,
    setChatFiles,
    removeChatFiles,
    removeChatFile,
    resetMessageSelected,
    loadMessages,
    loadMoreMessges, 
    addMessage,
    deleteMessages, 
    deleteAllMessages, 
    chatUserLogOut,
    updateUserOfChatSelected,
    toggleIsSelectedMessages,
    toggleLoadMoreMessages,
    setStartLoadMoreMessages,
    addSelectedMessage,
    removeSelectedMessage,
    removeSelectedMessages,
    addBlockedUsers,
    setResponseMessage,
    setIsRespMessage,
    removeIsRespMessage,
    removeResponseMessage,
    setOnlineUserChatSelected,
    setSelectedUsers,
    removeAllSelectedUsers,
    setImagesToUpload,
    addImagesToUpload,
    removeImageToUpload,
    removeAllImagesToUpload,
    toggleIsShowGifs,
    setIsShowGifs,
    removeIsShowGifs, 
    replaceCreator
} = chatSlice.actions;

export default chatSlice.reducer;