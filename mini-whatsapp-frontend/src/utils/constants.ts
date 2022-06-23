import { createElement } from 'react';
import { Profile, UserSettings, Privacy, PrivacyOptions } from '../components/auth';
import { ContactsBlocked, ContactForm, ContactInfo } from '../components/contacts';
import { Background, Help } from '../components/ui';
import { MessageInfo } from '../components/chats/MessageInfo';
import { GroupForm, GroupInfo, ListParticipants } from '../components/groups';

import { GifCategory } from '../interfaces/chat';

export const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
export const urlRegExp = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/);

export const sideBarMove = {
    profile: {
        title: 'Perfil',
        component: Profile
    },
    'user-settings': {
        title: 'Configuración',
        component: UserSettings
    },
    privacy: {
        title: 'Privacidad',
        component: Privacy
    },
    lastConnection: {
        title: 'Hora de últ. vez',
        component: PrivacyOptions
    },
    profilePhoto: {
        title: 'Foto de perfil',
        component: PrivacyOptions
    },
    'contacts-blocked': {
        title: 'Contactos bloqueados',
        component: ContactsBlocked
    },
    info: {
        title: 'Info.',
        component: PrivacyOptions
    },
    groups: {
        title: 'Grupos',
        component: PrivacyOptions
    },
    background: {
        title: 'Estabelcer fondo de pantalla',
        component: Background
    },
    help: {
        title: 'Ayuda',
        component: Help
    },
    'new-contact': { 
        title: 'Nuevo contacto',
        component: ContactForm
    },
    'new-group': {
        title: 'Nuevo grupo',
        component: GroupForm
    },
    'new-group-participants': {
        title: 'Añadir participantes',
        component: ListParticipants
    },
    'edit-contact': { 
        title: 'Editar contacto',
        component: ContactForm
    },
    'contact-info': { 
        title: 'Info. del contacto',
        component: ContactInfo  
    },
    'message-info': { 
        title: 'Info. del mensaje',
        component: MessageInfo
    },
    'group-info': {
        title: 'Info. del grupo',
        component: GroupInfo
    },
    '': {
        title: '',
        component: () => createElement('div', null)
    }
}

export const gifsCategories: { name: string; value: GifCategory }[] = [
    {
        name: 'POPULARES',
        value: 'trending'
    },
    {
        name: 'RISAS',
        value: 'laughs'
    },
    {
        name: 'TRISTES',
        value: 'sad'
    },
    {
        name: 'AMOR',
        value: 'love'
    },
    {
        name: 'EXPRESIVOS',
        value: 'excited'
    },
    {
        name: 'DEPORTES',
        value: 'sports'
    },
    {
        name: 'TV',
        value: 'tv'
    }
];