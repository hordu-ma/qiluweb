import {
    request,
    requestMedia,
    requestWithMethod,
	requestGet
}
    from './request';
export default {
    // /api/bsp/chat/streamSessionChat 流式对话
    streamSessionChat(data) {
        return request('/api/bsp/chat/streamSessionChat', data);
    },
    getDefaultBot(data) {
        return requestGet('/api/bot/get/default', data);
    },
    getBotKnowledgeConfig(data) {
        return request('/api/bot/getBotKnowledgeConfig', data);
    },
    deleteBotGroup(data) {
        return requestWithMethod('/api/bot/group/delete/'+data.id, 'DELETE', data);
    },
    createBotGroup(data) {
        return request('/api/bot/group/create', data);
    },
    updateBotGroup(data) {
        return request('/api/bot/group/update', data);
    },
    createOrUpdateBotGroup(data) {
        const url = data.id ?'/api/bot/group/update':'/api/bot/group/create';
        return request(url, data);
    },
    listGroup(data) {
        return requestGet('/api/bot/group/list');
    },
    listSystemBot(botGroupId) {
        return requestGet('/api/bot/grouprelations/listbygroup/'+botGroupId,);
    },
    listBot(data) {
        return request('/api/bot/system/list', data);
    },
    createOrUpdateBot(data) {
        const url = data.id?'/api/bot/update':'/api/bot/save';
        return request(url, data);
    },
    save(data) {
        return request('/api/bot/save', data);
    },
    update(data) {
        return request('/api/bot/update', data);
    },
    delete(data) {
        return request('/api/bot/delete/'+data.id, data);
    },
    get(data) {
        return request('/api/bot/get/'+data.id, data);
    },
	allSlave(data) {
	    return request('/api/bot/allSlave', data);
	},
	listSlave(data) {
	    return request('/api/bot/listSlave/'+data, data);
	},
	getQuestionParam(data) {
	    return request('/api/bot/getQuestionParam', data);
	},
	getHaleonSSOToken(data){
		return request('/api/sso/getToken?code='+data,data);
	},
	getUserName(data){
		return request("/api/sso/getInfo",data);
	},
	getBotKnowledgeConfig(data){
		return request('/api/bot/getBotKnowledgeConfig', data);
	},
	getSSOParam(data){
		return requestGet("/api/param/get-key?key="+data,data);
	},
}
