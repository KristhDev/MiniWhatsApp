import { useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';

import { RootState } from '../features/store';

const useSocket = () => useSelector<RootState, Socket>(({ socket: { socket } }) => socket);

export default useSocket;