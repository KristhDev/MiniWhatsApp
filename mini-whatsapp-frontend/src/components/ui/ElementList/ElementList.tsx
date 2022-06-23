import { useEffect, useState } from 'react';
import { useMount, useUpdateEffect } from 'react-use';
import { For } from 'react-loops';

import { useDebounce } from '../../../hooks';

import { ArrowBackIcon, SendMsgIcon } from '../../../utils/icons';

import { Element } from '../../../interfaces/ui';

import { ElementListProps } from './interfaces';

import './element-list.scss';

export const ElementList = ({ elements, disabledElements, multipleSelect, onChange, onConfirm }: ElementListProps) => {
    const [ objsIds, setObjsIds ] = useState<string[]>([]);
    const [ elementsNames, setElementsNames ] = useState<string[]>([]);
    const [ searchElements, setSearchElements ] = useState<Element[]>([]);

    const [ searchStringElements, setSearchStringElements ] = useState<string>('');
    const debounceStringElements = useDebounce(searchStringElements, 500);

    const handleRenderContactNames = () => {
        const names = elementsNames.map(name => `${ name }, `);
        names[names.length - 1] = names[names.length - 1].replace(',', '');

        return names;
    }

    const handleOnChange = (value: string) => {
        objsIds.includes(value)
            ? setObjsIds(objsIds.filter(objId => objId !== value)) 
            : setObjsIds([ ...objsIds, value ]);
    }

    const handleShowBtn = () => {
        return (multipleSelect)
            ? elementsNames.length > 0
            : elementsNames.length === 1;
    }

    useUpdateEffect(() => {
        onChange(objsIds);
        let names: string[] = [];

        elements.forEach(el => {
            if (objsIds.includes(el.id)) {
                names = [ ...names, el.name || '' ];
            }
        });

        setElementsNames(names);
    }, [ objsIds ]);

    useEffect(() => {
        if (debounceStringElements) setSearchElements(elements.filter(
            el => el.name.toLowerCase().includes(debounceStringElements.toLowerCase()))
        )
        else setSearchElements(elements);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ debounceStringElements ]);

    useMount(() => setObjsIds([]));

    return (
        <>
            <div className="element__search">
                <div className="field">
                    <button onClick={ () => setSearchStringElements('') }>
                        <ArrowBackIcon />
                    </button>

                    <input 
                        type="text"
                        onChange={ (e) => setSearchStringElements(e.target.value) }
                        value={ searchStringElements }
                    />
                </div>
            </div>

            <div className="element-list">
                <div className="list">
                    <For 
                        of={ searchElements }
                        as={ (element, { key }) => (
                            <div 
                                className="element-item" 
                                key={ element?.id || '' + key } 
                                onClick={ (e) => {
                                    e.preventDefault();
                                    handleOnChange(element?.id || '');
                                } }
                            >
                                <div className="element-item__checkbox">
                                    <input 
                                        checked={ objsIds.includes(element.id) }
                                        disabled={ disabledElements?.includes(element.id) }
                                        id={ `${ element.id }-checkbox` } 
                                        onChange={ () => handleOnChange(element.id) }
                                        type="checkbox" 
                                    />

                                    <label htmlFor={ `${ element.id }-checkbox` }></label>
                                </div>

                                <div className="element-item__image">
                                    <img 
                                        src={ element?.image } 
                                        alt="element-user"
                                        loading="lazy"
                                    />
                                </div>

                                <div 
                                    className={ 
                                        disabledElements?.includes(element.id) 
                                            ? 'element-item__content active-content' 
                                            : 'element-item__content'
                                    }
                                >
                                    <p>{ element.name }</p>
                                    <small>{ element?.description }</small>
                                </div>
                            </div>
                        ) }
                    />
                </div>

                <div className="actions">
                    <p>{ (handleShowBtn()) ? handleRenderContactNames() : <br /> }</p>

                    <button onClick={ onConfirm } className={ (handleShowBtn()) ? 'show-btn' : '' }>
                        <SendMsgIcon />
                    </button>
                </div>
            </div>
        </>
    );
}