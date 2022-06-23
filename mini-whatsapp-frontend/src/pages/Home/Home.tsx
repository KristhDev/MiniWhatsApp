import { useAudio, useEffectOnce } from 'react-use';
import { Else, If, Then } from '@anissoft/react-conditions';

import { useAppDispatch } from '../../features/store';

import { addContactBlockedUsers } from '../../features/auth';
import { setError } from '../../features/error';

import { useActions, useChat, useSocket } from '../../hooks';

import { ChatSelected } from '../../components/chats';
import { FileView, LoaderPopup, Sidebar, SidebarMove, Welcome } from '../../components/ui';

import {
    ContactUsersBlockedPayload,
    OnlineUserPayload,
    SendChatWithLastMessagePayload,
    SendRensendMessagesPayload,
    RecivedMessagePayload,
    NewGroupPayload,
    DeletedMessagesPayload,
    EditedGroupPayload,
    AddedParticipantToGroupPayload,
    RemovedUserGroupPayload,
    AppointedAsAdminPayload,
    RemovedAdminGroupPayload,
    AssignedCreatorToGroupPayload,
    RemovedGroupPhotoPayload,
    UpdatedUserSettingsPayload
} from '../../interfaces/socket';

import './home.scss';

const Home = () => {
    const [ audio, , controls ] = useAudio({
        src: './assets/audios/send-message.mp3',
        autoPlay: false
    });

    const dispatch = useAppDispatch();
    const socket = useSocket();

    const { 
        startRemoveChatNotifications,
        startSetOnlineContactUser,
        startSetResendMessages, 
        startAddMessage,
        startDeleteMessages, 
        startSetChatWithLastMessage, 
        startSetOnlineUserChatSelected,
        startSetGroup,
        startUpdateGroup,
        startRemoveUserOfChat,
        startAddPaticipantToGroup,
        startAddAdminOfGroup,
        startRemoveAdminOfGroup,
        startReplaceCreatorToGroup,
        startRemoveGroupPhoto,
        startUpdateUserSettings
    } = useActions();

    const { chatSelected } = useChat();

    useEffectOnce(() => {
        socket.on('miniwass-recived-message', (payload: RecivedMessagePayload) => {
            if (payload.status === 200) startAddMessage(payload?.message || {});
            else dispatch(setError({ msg: payload?.msg || '', status: payload?.status || 400 }));
        });

        socket.on('miniwass-send-rensend-messages', (payload: SendRensendMessagesPayload) => {
            startSetResendMessages(payload.status, payload.data, payload.msg);
        });

        socket.on('miniwass-send-notification', async (payload: { status: number }) => {
            if (payload.status === 200) {
                await controls.play();
                startRemoveChatNotifications();
            }
        });

        socket.on('miniwass-send-chat-with-last-message', (payload: SendChatWithLastMessagePayload) => {
            startSetChatWithLastMessage(payload.status, payload.chat, payload.msg);
        });

        socket.on('miniwass-deleted-messages', (payload: DeletedMessagesPayload) => {
            startDeleteMessages(payload.status, payload.messagesIds, payload.msg);
        });

        socket.on('miniwass-contact-users-blocked', (payload: ContactUsersBlockedPayload) => {
            dispatch(addContactBlockedUsers({ blockedUsers: payload.blockedUsers, userId: payload.userId }));
        });

        socket.on('miniwass-new-group', (payload: NewGroupPayload) => {
            startSetGroup(payload);
        });

        socket.on('miniwass-edited-group', (payload: EditedGroupPayload) => {
            startUpdateGroup(payload);
        });

        socket.on('miniwass-added-participant-to-group', (payload: AddedParticipantToGroupPayload) => {
            startAddPaticipantToGroup(payload);
        });

        socket.on('miniwass-removed-user-group', (payload: RemovedUserGroupPayload) => {
            startRemoveUserOfChat(payload);
        });

        socket.on('miniwass-appointed-as-admin', (payload: AppointedAsAdminPayload) => {
            startAddAdminOfGroup(payload);
        });

        socket.on('miniwass-removed-admin-group', (payload: RemovedAdminGroupPayload) => {
            startRemoveAdminOfGroup(payload);
        });

        socket.on('miniwass-assigned-creator-to-group', (payload: AssignedCreatorToGroupPayload) => {
            startReplaceCreatorToGroup(payload);
        });

        socket.on('miniwass-removed-group-photo', (payload: RemovedGroupPhotoPayload) => {
            startRemoveGroupPhoto(payload);
        });

        socket.on('miniwass-online-user', (payload: OnlineUserPayload) => {
            startSetOnlineContactUser(payload.userId, payload);
            startSetOnlineUserChatSelected({ ...payload });
        });

        socket.on('miniwass-updated-user-settings', (payload: UpdatedUserSettingsPayload) => {
            startUpdateUserSettings(payload);
        });
    });

    return (
        <div className="home">
            <FileView />

            <div className="home__chats">
                <SidebarMove />

                <Sidebar />
            </div>

            <div className="home__chat">
                { audio }
                <If condition={ !chatSelected.id }>
                    <Then children={ Welcome } />
                    <Else children={ ChatSelected } />
                </If>
            </div>

            <LoaderPopup />
        </div>
    );
}

export default Home;