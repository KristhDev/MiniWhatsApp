export interface ErrorState {
    msg: string;
    status: number;
}

export type SetErrorPayload = {
    msg: string;
    status: number;
}