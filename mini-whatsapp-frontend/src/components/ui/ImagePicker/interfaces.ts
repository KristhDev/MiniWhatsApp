export interface ImagePickerProps {
    className?: string;
    contextMenuId?: string;
    height: number;
    showBtnMenuUploadPhoto?: boolean;
    showBtnMenuRemovePhoto?: boolean;
    showBtnMenuShowPhoto?: boolean;
    onRemovePhoto?: () => void;
    onShowPhoto?: () => void;
    onUploadPhoto?: () => void;
    source: string;
    text: string;
    width: number;
}