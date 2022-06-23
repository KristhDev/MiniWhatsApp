import { Contact, Settings, User } from './auth';
import { ChatResponse } from './http';

export interface ChatState {
    chatSelected: {
        id: string;
        name: string;
        destinations: string[];
        description: string;
        height: number;
        createdBy: string;
        isGroup: boolean;
        users: User[];
        usersColors: { userId: string, color: string }[];
        files: MessageFile[];
    };
    messageSelected: Message;
    responseMessage: String;
    messages: Message[];
    isSelectedMessages: boolean;
    isRespMessage: boolean;
    startLoadMoreMessages: boolean;
    selectedMessages: string[];
    selectedUsers: string[];
    imagesPreviews: string[];
    imagesFiles: File[];
    isShowGifs: boolean;
}

export interface ChatsWithContact extends ChatResponse {
    contact: Contact;
}

export interface Message {
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isResending: boolean;
    user: string;
    chat: string;
    removedFor: string[];
    responseTo?: Message;
    src?: {
        image?: string;
        gif?: string;
    };
    _id: string;
}

export interface MessageFile {
    _id: string;
    user: string;
    url: string;
    content?: string;
    createdAt: Date;
}

export interface Notification {
    _id: string;
    chat: string;
    readBy: string[];
}

export type GifCategory = 'trending' | 'laughs' | 'sad' | 'love' | 'excited' | 'sports' | 'tv';

export interface GifsResponse {
    data:       Datum[];
    pagination: Pagination;
    meta:       Meta;
}

export interface Datum {
    type:                       Type;
    id:                         string;
    url:                        string;
    slug:                       string;
    bitly_gif_url:              string;
    bitly_url:                  string;
    embed_url:                  string;
    username:                   string;
    source:                     string;
    title:                      string;
    rating:                     Rating;
    content_url:                string;
    source_tld:                 string;
    source_post_url:            string;
    is_sticker:                 number;
    import_datetime:            string;
    trending_datetime:          string;
    images:                     Images;
    user?:                      UserGif;
    analytics_response_payload: string;
    analytics:                  Analytics;
}

export interface Analytics {
    onload:  Onclick;
    onclick: Onclick;
    onsent:  Onclick;
}

export interface Onclick {
    url: string;
}

export interface Images {
    original:                 { [key: string]: string };
    downsized:                The480_WStill;
    downsized_large:          The480_WStill;
    downsized_medium:         The480_WStill;
    downsized_small:          The4_K;
    downsized_still:          The480_WStill;
    fixed_height:             { [key: string]: string };
    fixed_height_downsampled: { [key: string]: string };
    fixed_height_small:       { [key: string]: string };
    fixed_height_small_still: The480_WStill;
    fixed_height_still:       The480_WStill;
    fixed_width:              { [key: string]: string };
    fixed_width_downsampled:  { [key: string]: string };
    fixed_width_small:        { [key: string]: string };
    fixed_width_small_still:  The480_WStill;
    fixed_width_still:        The480_WStill;
    looping:                  { [key: string]: string };
    original_still:           The480_WStill;
    original_mp4:             The4_K;
    preview:                  The4_K;
    preview_gif:              The480_WStill;
    preview_webp:             The480_WStill;
    hd?:                      The4_K;
    "480w_still":             The480_WStill;
    "4k"?:                    The4_K;
}

export interface The480_WStill {
    height: string;
    width:  string;
    size:   string;
    url:    string;
}

export interface The4_K {
    height:   string;
    width:    string;
    mp4_size: string;
    mp4:      string;
}

export enum Rating {
    G = "g",
}

export enum Type {
    GIF = "gif",
}

export interface UserGif {
    avatar_url:    string;
    banner_image:  string;
    banner_url:    string;
    profile_url:   string;
    username:      string;
    display_name:  string;
    description:   string;
    instagram_url: string;
    website_url:   string;
    is_verified:   boolean;
}

export interface Meta {
    status:      number;
    msg:         string;
    response_id: string;
}

export interface Pagination {
    total_count: number;
    count:       number;
    offset:      number;
}

export interface SetGroupInfo {
    group: ChatResponse;
    users: User[];
    destinations: string[];
    status: number;
    msg?: string;
}

export type SetChatSelectedPayload = { 
    id: string, 
    name: string, 
    destinations: string[], 
    description: string, 
    users: User[], 
    isGroup: boolean,
    createdBy: string,
}

export type SetChatHeightPayload = { 
    chatHeight: number 
}

export type SetUsersInChatSelected = { 
    users: User[], 
    destinations: string[] 
}

export type SetUsersColorsPayload = { 
    usersColors: { 
        userId: string, 
        color: string 
    }[] 
}

export type SetNameAndDescriptionPayload = { 
    name: string, 
    description: string 
}

export type RemoveUserOfChatPayload = { 
    userId: string 
}

export type SetMessagesFilesPayload = {
    files: MessageFile[]
}

export type AddChatFilePayload = {
    file: MessageFile
}

export type RemoveChatFilePayload = {
    id: string
}

export type SetMessageSelectd = { 
    message: Message 
}

export type LoadMessagesPayload = { 
    messages: Message[]
}

export type LoadMoreMessagesPayload = { 
    messages: Message[] 
}

export type SetStartLoadMoreMessages = { 
    startLoadMoreMessages: boolean 
}

export type AddMessagePayload = { 
    message: Message 
}

export type UpdatedUserOfChatSelectedPayload = { 
    user: User 
}

export type AddSelectedMessagePayload = { 
    id: string 
}

export type RemovedSelectedMessagePayload = { 
    id: string 
}

export type AddSelectedChatPayload = { 
    id: string 
}

export type RemovedSelectedChatPayload = {
    id: string
}

export type DeletingMessagesPayload = { 
    ids: string[] 
}

export type AddBlockedUsersPayload = { 
    blockedUsers: string[], 
    userId: string
}

export type SetSelectedUsersPayload = {
    usersIds: string[]
}

export type AddAdminToMyChatsPayload = {
    chatId: string,
    userId: string
}

export type RemoveAdminToMyChatsPayload = {
    chatId: string,
    userId: string
}


export type AddUserToChatSelectedPayload = {
    user: User;
    userColor: string;
    destination: string;
}

export type UpdateUserSettingsOfUserPayload = {
    settings: Settings;
}

export type SetResponseMessagePayload = { 
    respMsgId: string 
}

export type SetOnlineUserChatSelectedPayload = { 
    online: boolean, 
    lastConnection: Date, 
    userId: string 
}

export type SetImagesToUploadPayload = {
    imagesFiles: File[];
    imagesPreviews: string[];
}

export type AddImagesToUploadPayload = {
    imagesFiles: File[];
    imagesPreviews: string[];
}

export type RemoveImageToUploadPayload = {
    index: number;
}

export type ReplaceCreatorPayload = {
    creatorId: string;
}