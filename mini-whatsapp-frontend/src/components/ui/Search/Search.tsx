import { SearchIcon } from '../../../utils/icons';

import './search.scss';

interface SearchProps {
    onChange: (value: string) => void;
    value: string;
}

export const Search = ({ onChange, value }: SearchProps) => {
    return (
        <div className="search">
            <form className="search__form">
                <div className="form-group">
                    <button type="button">
                        <SearchIcon />
                    </button>

                    <input 
                        type="text" 
                        onChange={ (e) => onChange(e.target.value) }
                        value={ value }
                        placeholder="Busca un chat o inicia uno nuevo" 
                    />
                </div>
            </form>
        </div>
    );
}