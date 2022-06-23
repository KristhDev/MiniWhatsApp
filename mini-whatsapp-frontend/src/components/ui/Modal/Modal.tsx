import { CancelIcon } from '../../../utils/icons';

import './modal.scss';

interface ModalProps {
    children: JSX.Element;
    onCloseModal: () => void;
    title: string;
}

export const Modal = ({ title, children, onCloseModal }: ModalProps) => {
    return (
        <div className="modal">
            <div className="modal__title">
                <button onClick={ onCloseModal }>
                    <CancelIcon />
                </button>

                <h2>{ title }</h2>
            </div>

            <div className="modal__content">
                { children }
            </div>
        </div>
    ); 
}