import {
    request,
    requestMedia,
    requestMedia3,
    requestMedia2
} from './request';
export default {
    // /chat-app-api/api/history/updateUseSendById 更新历史会话
    updateHistory(data) {
        return request('/api/history/updateUseSendById', data);
    },
    updateGroup(data) {
        return request('/api/chat/history-group/update', data);
    },
    removeGroup(data) {
        return request('/api/chat/history-group/remove', data);
    },
    getHistoryList(data) {
        return request('/api/history/list', data);
    },
    createHistoryGroup(data) {
        return request('/api/chat/history-group/create', data);
    },
    listGroupHistory(data) {
        return request('/api/chat/history-group/history/list', data);
    },
    updateById(data) {
        return request('/api/history/updateUseSendById', data);
    },
    list(data) {
        return request('/api/history/list', data);
    },
    download(data) {
        return requestMedia2('/api/history/download', data);
    },    
    downloadHistroy(data) {
        return requestMedia3('/api/history/download', data);
    },  
    deleteHistory(data) {
        return request('/api/history/delete', data);
    }
}