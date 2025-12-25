import {
    request,
    requestMedia,
    requestPost,
	requestGet
}
from './request';

export default {
    uploadExcel(formData) {
        return requestPost('/api/poc/ningbo/uploadExcel', formData);
    },
    getFileNames(params) {
        return requestGet('/api/poc/ningbo/getFileNames', params);
    },
    getChat(param) {
        return requestPost('/api/poc/ningbo/chat', param);
    },
    getStreamChat(param) {
        return requestPost('/api/poc/ningbo/streamChat', param);
    },
    ningboChat(params) {
        return requestPost('/api/poc/ningbo/chat', params);
    }
}