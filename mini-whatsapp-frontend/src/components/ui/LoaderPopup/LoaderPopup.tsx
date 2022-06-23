import { TailSpin } from 'react-loader-spinner';

import { useUi } from '../../../hooks';

import './loader-popup.scss';

export const LoaderPopup = () => {
    const { loaderPopupMsg, showLoaderPopup } = useUi();

    return (
        <div className={ (showLoaderPopup) ? 'loader-popup show-loader-popup' : 'loader-popup' }>
            <TailSpin color="#FAFAFA" height={ 25 } width={ 25 } />

            <p>{ loaderPopupMsg }</p>
        </div>
    );
}