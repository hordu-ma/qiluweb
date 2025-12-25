import {
    request, requestGet,
    requestMedia,
    requestPost
}
    from './request';
export default {
    deleteVec(namespaceId, fileId, uuidList) {
        return request('/api/vec/del/'+namespaceId+'/'+fileId, uuidList);
    },
    insertVec(namespaceId, data) {
        return request('/api/vec/'+namespaceId+'/insert', data);
    },
    updateVec(namespaceId, data) {
        return request('/api/vec/'+namespaceId+'/update', data);
    },
    pageVec(data) {
        return request('/api/vec/page', data);
    },
    findImagesVec(data) {
        return request('/api/vec/find-images', data);
    },
}
