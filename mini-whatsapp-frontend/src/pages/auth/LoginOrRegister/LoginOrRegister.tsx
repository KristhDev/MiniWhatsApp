import { useLocation } from 'react-router-dom';
import { Else, If, Then } from '@anissoft/react-conditions';

import { LoginForm, RegisterForm } from '../../../components/auth';

import wellcomeIcon from '../../../assets/images/wellcome-img.png';

import './login-or-register.scss';

const LoginOrRegister = () => {
    const { pathname } = useLocation();

    return (
        <div className="login-register-screen">
            <div className="login-register-screen__wellcome">
                <h2 className="title-screen">Welcome to Mini WhatsApp</h2>

                <div>
                    <img 
                        loading="lazy" 
                        src={ wellcomeIcon } 
                        alt="mini-whatsapp-wellcome" 
                    />
                </div>
            </div>

            <div className="login-register-screen__form">
                <If condition={ pathname === '/login' }>
                    <Then children={ LoginForm } />
                    <Else children={ RegisterForm } />
                </If>
            </div>
        </div>
    );
}

export default LoginOrRegister;