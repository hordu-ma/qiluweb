import {
    request,
    requestMedia,
    requestPost
}
    from './request';
export default {
    allNamespace(data) {
        return request('/api/namespace/all', data);
    },
    listNamespace(data) {
        return request('/api/namespace/list', data);
    },
    saveNamespace(data) {
        return request('/api/namespace/save', data);
    },
    updateNamespace(data) {
        return request('/api/namespace/update', data);
    },
    deleteNamespace(data) {
        return request('/api/namespace/delete/'+data.id, data);
    },
    getNamespace(data) {
        return request('/api/namespace/get/'+data.id, data);
    },
}
