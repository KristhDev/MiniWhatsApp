import { MessageFile } from './chat';

export type SideBarMoveType = 
    | 'profile' 
    | 'user-settings'
    | 'privacy'
    | 'lastConnection'
    | 'profilePhoto'
    | 'contacts-blocked'
    | 'info'
    | 'groups'
    | 'background'
    | 'help'
    | 'new-contact' 
    | 'new-group-participants'
    | 'new-group'
    | 'group-info'
    | 'contact-info' 
    | 'message-info'
    | 'edit-contact' 
    | '';

export type FileViewType = 'profile' | 'group' | 'message' | 'contact' | '';

export interface UiState {
    showLoaderPopup: boolean,
    loaderPopupMsg: string,
    showSideBarMove: boolean,
    sideBarMoveType: SideBarMoveType,
    showImageView: boolean,
    files: MessageFile[],
    fileIndex: number
    fileViewType: FileViewType
}

export interface Element {
    id: string;
    name: string;
    description?: string;
    image?: string;
}

export type uiShowSidebarMovePayload = {
    sidebarMoveType: SideBarMoveType
}

export type ShowLoaderPopupPayload = {
    msg: string;
}

export type SetFilesPayload = {
    files: MessageFile[];
}

export type AddChatFilePayload = {
    file: MessageFile;
}

export type RemoveFilePayload = {
    fileId: string;
}

export type SetFileIndexPayload = {
    fileIndex: number;
}

export type SetFileViewTypePaylaod = {
    fileViewType: FileViewType;
}