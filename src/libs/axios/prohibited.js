import {
    request,
    requestMedia,
    requestPost
}
    from './request';
export default{
	listProhibited(data) {
	    return request('/api/prohibited/list', data);
	},
	saveProhibited(data) {
	    return request('/api/prohibited/save', data);
	},
	updateProhibited(data) {
	    return request('/api/prohibited/update', data);
	},
	deleteProhibited(data) {
	    return request('/api/prohibited/delete/'+data.id, data);
	},
	getProhibited(data) {
	    return request('/api/prohibited/get/'+data.id, data);
	},
}