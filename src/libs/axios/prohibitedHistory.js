import {
    request,
    requestMedia,
    requestPost
}
    from './request';
export default{
	listProhibitedHistory(data) {
	    return request('/api/prohibited-history/list', data);
	},
	rollbackProhibitedHistory(data){
		return request('/api/prohibited-history/rollback/'+data.ruleVersion,data);
	}
}