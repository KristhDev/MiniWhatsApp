import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'reduxjs-toolkit-persist/lib/integration/react';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import 'dayjs/locale/es';

import App from './App';

import store, { persistor } from './features/store';

import './assets/scss/index.scss';

dayjs.extend(calendar);
dayjs.locale('es');

const MiniWhatsApp = () => {
    return (
        <Provider store={ store }>
            <PersistGate loading={ null } persistor={ persistor }>
                <App />
            </PersistGate>
        </Provider>
    );
}

ReactDOM.render(<MiniWhatsApp />, document.getElementById('root'));