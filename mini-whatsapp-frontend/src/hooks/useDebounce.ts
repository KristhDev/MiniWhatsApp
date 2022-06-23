import { useEffect, useState } from 'react';

const useDebounce= (input: string = '', time: number = 500) => {
    const [ debouncedValue, setDebouncedValue ] = useState<string>(input);

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setDebouncedValue(input);
        }, time);

        return () => {
            clearTimeout(timeOut);
        }
    }, [ input, time ]);

    return debouncedValue;
}

export default useDebounce;