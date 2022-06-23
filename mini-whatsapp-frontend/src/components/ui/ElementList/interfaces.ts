import { Element } from '../../../interfaces/ui';

export interface ElementListProps {
    elements: Element[],
    disabledElements?: string[],
    multipleSelect: boolean;
    onChange: (chatIds: string[]) => void,
    onConfirm: () => void
}