import { useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { For } from 'react-loops';

import { useAppDispatch } from '../../../features/store';

import { removeIsShowGifs } from '../../../features/chat';

import { useAuth, useChat, useDebounce, useSocket } from '../../../hooks';

import { GifCategory, GifsResponse } from '../../../interfaces/chat';

import { gifsCategories } from '../../../utils/constants';

import { giphyApi } from '../../../api';

import './message-gif.scss';

export const MessageGif = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const [ gifCategorySelected, setGifCategorySelected ] = useState<GifCategory>('trending');
    const [ gifs, setGifs ] = useState<{ id: string; url: string; }[]>([]);
    const [ gifSearch, setGifSearch ] = useState<string>('');

    const { user: { id: userId } } = useAuth();
    const { isShowGifs, chatSelected: { id: chatId, destinations } } = useChat();
    const gifTextDebounce = useDebounce(gifSearch, 1000);

    const handleGetTrendingGifs = async () => {
        setGifs([]);
        const { data } = await giphyApi<GifsResponse>({ endPoint: 'trending', method: 'GET' });

        const gifsMins = data.data.map(gif => ({
            id: gif.id,
            url: gif.images.original.url
        }));

        setGifs(gifsMins);
    }

    const handleSearchGifs = async (search: string) => {
        setGifs([]);
        const { data } = await giphyApi<GifsResponse>({ 
            endPoint: 'search', method: 'GET', params: { q: search } 
        });

        const gifsMins = data.data.map(gif => ({
            id: gif.id,
            url: gif.images.original.url
        }));

        setGifs(gifsMins);
    }

    const handleSendGif = (url: string) => {
        dispatch(removeIsShowGifs());

        socket.emit('miniwass-send-message-gif', {
            gif: url,
            userId,
            chatId,
            destinations
        });
    }

    useEffect(() => {
        if (isShowGifs) {
            if (gifCategorySelected === 'trending') handleGetTrendingGifs();
            else handleSearchGifs(gifCategorySelected);
        }
    }, [ gifCategorySelected, isShowGifs ]);

    useEffect(() => {
        if (!isShowGifs) setGifSearch('');
    }, [ isShowGifs ]);

    useUpdateEffect(() => {
        if (gifTextDebounce) handleSearchGifs(gifTextDebounce);
        else handleGetTrendingGifs();
    }, [ gifTextDebounce ]);

    return (
        <>
            <div className="gifs__categories">
                <For
                    of={ gifsCategories }
                    children={ ({ name, value }) => (
                            <div 
                                onClick={ () => setGifCategorySelected(value) } 
                                className={ (gifCategorySelected === value) 
                                    ? 'active-btn-category btn-category' 
                                    : 'btn-category'
                                }
                            >
                                { name }
                            </div>
                        ) 
                    }
                />
            </div>

            <div className="gifs__input">
                <input 
                    type="text" 
                    placeholder="Buscar GIF" 
                    onChange={ (e) => setGifSearch(e.target.value) }
                    value={ gifSearch }
                />
            </div>

            <div className="gifs__list">
                <For
                    of={ gifs }
                    children={ ({ url, id }) => (
                            <div onClick={ () => handleSendGif(url) } className="gif-item">
                                <img loading="lazy" src={ url } alt={ id } />
                            </div>
                        ) 
                    }
                />
            </div>
        </>
    );
}