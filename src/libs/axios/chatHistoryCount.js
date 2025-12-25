import {
    request,
    requestMedia,
    requestPost,
}
    from './request';
export default {
    sumCount(data) {
        return request('/api/historyCount/sumCount', data);
    },
    listHistoryCount(data) {
        return request('/api/historyCount/list', data);
    },
    selectGroupByIdHistoryCount(data) {
        return request('/api/historyCount/selectGroupById/'+data.id, data);
    },
}