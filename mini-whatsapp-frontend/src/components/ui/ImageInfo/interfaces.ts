export interface ImageInfoProps {
    image: string;
    title: string;
    onClick?: () => void;
    onShowPhoto?: () => void;
    onRemovePhoto?: () => void;
    onUploadPhoto?: () => void;
    text: string;
    isGroup: boolean;
    isAdmin?: boolean;
    contextMenuId?: string;
    showBtnMenuRemovePhoto?: boolean;
}