import { TFuncResponse } from 'types/rest';
import { request } from 'utils/request';

export const requestFileUpload = async (file: File): Promise<TFuncResponse<string>> => {
    const fileFormData: any = new FormData();
    fileFormData.append('event', 'file');
    fileFormData.append('file', file);
    return request('uploadResource', { method: 'POST', dataRaw: fileFormData });
};
