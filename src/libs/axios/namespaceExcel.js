import {
    request,
    requestMedia,
    requestPost
}
    from './request';
export default {
    // 关联文件分页查询
    relationExcelPage(data) {
        return request('/api/namespace/excel-relation/page', data);
    },
}
