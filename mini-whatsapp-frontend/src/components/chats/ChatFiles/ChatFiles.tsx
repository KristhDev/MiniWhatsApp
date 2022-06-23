import { useEffect, useState } from 'react';
import { If } from '@anissoft/react-conditions';
import { For } from 'react-loops';

import { useAppDispatch } from '../../../features/store';

import { setFileIndex, setFiles, setFileViewType, showImageView } from '../../../features/ui';

import { useChat } from '../../../hooks';

import { MessageFile } from '../../../interfaces/chat';

import { ArrowDownIcon } from '../../../utils/icons';

import './chat-files.scss';

export const ChatFiles = () => {
    const dispatch = useAppDispatch();

    const { chatSelected: { files } } = useChat();

    const [ filesPrev, setFilesPrev ] = useState<MessageFile[]>((files.length <= 3) ? [ ...files ].reverse() : [ ...files.slice(files.length - 3, files.length)].reverse());

    const handleShowImageView = (index: number) => {
        dispatch(showImageView());
        dispatch(setFiles({ files }));

        dispatch(setFileIndex({ 
            fileIndex: (files.length === 1) 
                ? 0
                : files.length - (index + 1) 
        }));
        dispatch(setFileViewType({ fileViewType: 'message' }));
    }

    useEffect(() => {
        setFilesPrev((files.length <= 3) ? [ ...files ].reverse() : [ ...files.slice(files.length - 3, files.length)].reverse());
    }, [ files ]);

    return (
        <div className="chat-files">
            <div className="chat-files__header">
                <small 
                    style={{ 
                        cursor: (files.length === 0) ? 'initial' : 'pointer'
                    }}
                    onClick={ 
                        (files.length === 0)
                            ? undefined 
                            :  () => handleShowImageView(0) 
                    }
                >
                    Archivos, enlaces y documentos
                </small>

                <button 
                    disabled={ files.length === 0 }
                    style={{
                        cursor: (files.length === 0) ? 'initial' : 'pointer'
                    }}
                    onClick={ () => handleShowImageView(0) }
                >
                    { files.length }
                    <ArrowDownIcon />
                </button>
            </div>

            <If condition={ filesPrev.length > 0 }>
                <div 
                    className="chat-files__files"
                    style={{
                        justifyContent: (files.length >= 3) ? 'space-around' : 'flex-start' 
                    }}
                >
                    <For
                        of={ filesPrev }
                        children={ ({ url }, { index }) => (
                            <div
                                className="file-item"
                                onClick={ () => handleShowImageView(index) }
                            >
                                <img src={ url } alt="" />
                            </div>
                        ) }
                    />
                </div>
            </If>
        </div>
    );
}
