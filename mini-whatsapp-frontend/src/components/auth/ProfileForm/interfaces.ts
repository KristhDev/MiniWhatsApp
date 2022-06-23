import { Dispatch, KeyboardEvent, SetStateAction } from 'react';

export interface ProfileFormFields {
    username: string;
    description: string;
}

export interface KeyPressData {
    e: KeyboardEvent<HTMLInputElement>;
    values: ProfileFormFields;
    setFieldDisabled: Dispatch<SetStateAction<boolean>>;
}

export interface Target {
    target: HTMLInputElement
}

export type InputEventField = KeyboardEvent<HTMLInputElement> & Target;

export interface ProfileFormProps {
    values: ProfileFormFields,
    isValid: boolean
}