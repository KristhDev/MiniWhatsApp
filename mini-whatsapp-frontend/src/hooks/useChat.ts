import { useSelector } from 'react-redux';

import { RootState } from '../features/store';
import { ChatState } from '../interfaces/chat';

const useChat = () => useSelector<RootState, ChatState>(state => state.chats);

export default useChat;