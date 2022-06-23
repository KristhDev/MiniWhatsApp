import { KeyboardEvent } from 'react';

export interface GroupFormFields {
    name: string;
    usersIds: string[];
    usersPhones: string[];
    image?: File
}

export interface Target {
    target: HTMLInputElement
}

export type InputEventField = KeyboardEvent<HTMLInputElement> & Target;