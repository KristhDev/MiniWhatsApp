import { useMount, useUpdateEffect } from 'react-use';
import { Else, If, Then } from '@anissoft/react-conditions';

import { useAppDispatch } from './features/store';

import AppRouter from './routers/AppRouter';

import { useAuth, useSocket } from './hooks';

import { startRenewAuth } from './features/auth';
import { chatUserLogOut } from './features/chat';

import { ProgressBar } from './components/ui';

import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import 'react-contexify/dist/ReactContexify.css';
import './assets/scss/index.scss';

const App = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthLoading } = useAuth();
  const socket = useSocket();

  useMount(() => {
    if (localStorage.getItem('miniwass-token')) dispatch(startRenewAuth());
  });

  useUpdateEffect(() => {    
    socket.auth = {
      'x-token': localStorage.getItem('miniwass-token') || ''
    }

    if (user.id) socket.connect();
    else socket.disconnect();
  }, [ user ]);

  window.onbeforeunload = () => false;
  window.onunload = () => dispatch(chatUserLogOut());

  return (
    <div className="container">
      <div className="title-bar">
        Mini WhatsApp
      </div>

      <If condition={ isAuthLoading }>
        <Then>
          <ProgressBar />
        </Then>

        <Else>
          <AppRouter />
        </Else>
      </If>
    </div>
  );
}

export default App;