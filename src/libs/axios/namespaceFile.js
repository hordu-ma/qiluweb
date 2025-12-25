import {
    request,
    requestMedia,
    requestPost
}
    from './request';
export default {
    allNamespaceFileByNamespace(namespaceId) {
        return request('/api/namespace/file/'+namespaceId,'');
    },
    allNamespaceFile(data) {
        return request('/api/namespace/file/all', data);
    },
    listNamespaceFile(data) {
        return request('/api/namespace/file/list', data);
    },
    saveNamespaceFile(data) {
        return request('/api/namespace/file/save', data);
    },
    uploadNamespaceFile(data) {
        return request('/api/namespace/file/upload', data);
    },
    updateNamespaceFile(data) {
        return request('/api/namespace/file/update', data);
    },
    deleteNamespaceFile(data) {
        return request('/api/namespace/file/delete/'+data.id, data);
    },
    getNamespaceFile(data) {
        return request('/api/namespace/file/get/'+data.id, data);
    },
    downloadNamespaceFile(data) {
        return requestMedia('/api/namespace/file/download/'+data.id, data);
    },
    previewNamespaceFile(data) {
        return requestMedia('/api/namespace/file/preview/'+data.id, data);
    },
    // 清空分片
    removeChunk(data) {
        return request('/api/namespace/file/remove-chunk', data);
    },
    // 生成分片
    generateChunk(data) {
        return request('/api/namespace/file/generate-chunk', data);
    },
}
