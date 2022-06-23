export type ContactButtonIcon =
    | 'block'
    | 'unblock'
    | 'blockuser'
    | 'trash'
    | 'leave';

export interface ContactButtonProps {
    icon: ContactButtonIcon;
    text: string;
    action: () => void;
}