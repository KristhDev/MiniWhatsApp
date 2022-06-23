export interface GroupData {
    name: string;
    usersIds: string[];
    authId: string;
    image?: any;
}

export interface NewGroup {
    name: string;
    createdBy: string;
    admins: string[];
    users: string[];
    isGroup: boolean;
    image?: string;
}