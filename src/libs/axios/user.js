import {
    request,
    requestMedia3,
    requestMedia,
	requestWithMethod 
}
from './request';

export default {
    // /chat-manager-api/api/user/downloadTemplate
    downloadTemplate(params) {
        return requestMedia('/api/user/downloadTemplate', params);
    },
    updateUser(data) {
        return requestWithMethod('/api/user/updateUser', 'PUT', data);
    },
    exportUsers(data) {
        return requestMedia3('/api/user/exportUsers', data);
    },
    batchDeleteUsers(data) {
        return request('/api/user/batchDeleteUsers', data);
    },
    userList(data) {
        return request('/api/user/list', data);
    },
}