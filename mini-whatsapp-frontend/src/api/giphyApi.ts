import axios, { Method, AxiosRequestConfig } from 'axios';

interface GiphyApiData {
    endPoint: string;
    method?: Method;
    params?: AxiosRequestConfig['params'];
}

const giphyApi = <T>({ endPoint, method, params }: GiphyApiData) => { 
    return axios.request<T>({
        baseURL: `https://api.giphy.com/v1/gifs/${ endPoint }`,
        method,
        params: {
            api_key: process.env.REACT_APP_GIPHY_API_KEY,
            limit: 50, 
            rating: 'g',
            ...params
        }
    });
}

export default giphyApi;