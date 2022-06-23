import { ArrowDownIcon } from '../../../utils/icons';

import { PrivacyActionProps } from './interfaces';

import './privacy-action.scss';

export const PrivacyAction = ({ onClick, subText, text }: PrivacyActionProps) => {
    return (
        <div 
            className="privacy-action"
            onClick={ onClick }
        >
            <div className="privacy-action__text">
                <p>{ text }</p>
                <small>{ subText }</small>
            </div>

            <div className="privacy-action__icon">
                <ArrowDownIcon />
            </div>
        </div>
    );
}