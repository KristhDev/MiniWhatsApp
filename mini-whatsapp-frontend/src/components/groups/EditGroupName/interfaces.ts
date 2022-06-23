import { KeyboardEvent } from 'react';

export interface EditGroupFormFields {
    name: string
}

export interface Target {
    target: HTMLInputElement
}

export type InputEventField = KeyboardEvent<HTMLInputElement> & Target;