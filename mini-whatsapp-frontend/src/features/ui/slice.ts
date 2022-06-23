import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { 
    UiState,
    ShowLoaderPopupPayload,
    uiShowSidebarMovePayload,
    SetFilesPayload,
    SetFileIndexPayload,
    SetFileViewTypePaylaod,
    AddChatFilePayload, 
    RemoveFilePayload
} from '../../interfaces/ui';

const INITIAL_STATE: UiState = {
    showLoaderPopup: false,
    loaderPopupMsg: '',
    showSideBarMove: false,
    sideBarMoveType: '',
    showImageView: false,
    files: [],
    fileIndex: 0,
    fileViewType: ''
}

const uiSlice = createSlice({
    name: 'ui',
    initialState: INITIAL_STATE,
    reducers: {
        showLoaderPopup: (state: UiState, action: PayloadAction<ShowLoaderPopupPayload>) => {
            state.showLoaderPopup = true;
            state.loaderPopupMsg = action.payload.msg;
        },

        hideLoaderPopup: (state: UiState) => {
            state.showLoaderPopup = false;
            state.loaderPopupMsg = '';
        },

        showSidebarMove: (state: UiState, action: PayloadAction<uiShowSidebarMovePayload>) => {
            state.showSideBarMove = true;
            state.sideBarMoveType = action.payload.sidebarMoveType;
        },

        hideSidebarMove: (state: UiState) => {
            state.showSideBarMove = false;
            state.sideBarMoveType = '';
        },

        showImageView: (state: UiState) => {
            state.showImageView = true;
        },

        hideImageView: (state: UiState) => {
            state.showImageView = false;
        },

        setFiles: (state: UiState, action: PayloadAction<SetFilesPayload>) => {
            state.files = action.payload.files;
        },

        addFile: (state: UiState, action: PayloadAction<AddChatFilePayload>) => {
            const filesSet = new Set([ ...state.files, action.payload.file ].map(f => JSON.stringify(f)));
            state.files = Array.from(filesSet).map(f => JSON.parse(f));
        },

        removeFile: (state: UiState, action: PayloadAction<RemoveFilePayload>) => {
            state.files = state.files.filter((f) => f._id !== action.payload.fileId);
        },

        clearFiles: (state: UiState) => {
            state.files = [];
        },

        setFileIndex: (state: UiState, action: PayloadAction<SetFileIndexPayload>) => {
            state.fileIndex = action.payload.fileIndex;
        },

        setFileViewType: (state: UiState, action: PayloadAction<SetFileViewTypePaylaod>) => {
            state.fileViewType = action.payload.fileViewType;
        },

        clearFileViewType: (state: UiState) => {
            state.fileViewType = '';
        },

        uiUserLogOut: () => {
            return { ...INITIAL_STATE }
        }
    }
});

export const { 
    showLoaderPopup,
    hideLoaderPopup,
    showSidebarMove,
    hideSidebarMove,
    showImageView,
    hideImageView,
    setFiles,
    addFile,
    removeFile,
    clearFiles,
    setFileIndex,
    setFileViewType,
    clearFileViewType,
    uiUserLogOut 
} = uiSlice.actions;

export default uiSlice.reducer;