import { KeyboardEvent } from 'react';

export interface ChatFormFields {
    message: string
}

export interface ChatFormValidate {
    message?: string
}

export type TextAreaEvent = KeyboardEvent<HTMLTextAreaElement>;