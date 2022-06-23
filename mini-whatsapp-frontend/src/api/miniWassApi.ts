import axios, { Method } from 'axios';

interface MiniWassApiData {
    method: Method;
    endPoint: string;
    contentType: string;
    data?: any;
}

const miniWassApi = <T>({ method, endPoint, contentType, data }: MiniWassApiData) => {
    const basicUrl = `${ process.env.REACT_APP_API_URL }/api`;
    const token = localStorage.getItem('miniwass-token');

    return axios.request<T>({
        method,
        url: `${ basicUrl }/${ endPoint }`,
        headers: {
            'Content-type': contentType,
            'x-token': token || ''
        },
        data
    });
}

export default miniWassApi;