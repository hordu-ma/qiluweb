export const breadCrumbs = {
    '/chatBot': {
        activeName: 'chatBot',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: 'Bot查询',
            path: '/chatBot'
        }]
    },
    '/agentBot': {
        activeName: 'agentBot',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: 'Bot代理',
            path: '/agentBot'
        }]
    },
    '/chatStart': {
        activeName: 'chatStart',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: '项目演示',
            path: '/main'
        },{
	        title: '宁波针织',
	        path: '/chatStart'
	    }]
    },
    '/chatHistory': {
        activeName: 'chatHistory',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: '聊天历史记录',
            path: '/chatHistoryCount'
        },{
	        title: '聊天历史详情',
	        path: '/chatHistory'
	    }]
    },
	// '/chatHistory?groupDate=': {
	//     activeName: 'chatHistory?groupDate=',
	//     list: [{
	//         title: '首页',
	//         path: '/main'
	//     }, {
 //            title: '聊天历史记录',
 //            path: '/chatHistoryCount'
 //        },{
	//         title: '聊天历史详情',
	//         path: '/chatHistory?groupDate='
	//     }]
	// },
    '/chatHistoryCount': {
        activeName: 'chatHistoryCount',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: '聊天历史记录',
            path: '/chatHistoryCount'
        }]
    },
    '/namespaceIndex': {
        activeName: 'namespaceIndex',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: '知识库概览',
            path: '/namespaceIndex'
        }]
    },
    '/namespaceList': {
        activeName: 'namespaceList',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: '知识库查询',
            path: '/namespaceList'
        }]
    },
    '/namespaceFile': {
        activeName: 'namespaceFile',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: '知识库查询',
            path: '/namespaceList'
        }, {
            title: '知识库文件',
            path: '/namespaceFile'
        }]
    },
    '/namespaceExcel': {
        activeName: 'namespaceExcel',
        list: [{
            title: '首页',
            path: '/main'
        }, {
            title: '知识库查询',
            path: '/namespaceList'
        }, {
            title: '知识库文件',
            path: '/namespaceFile?id='
        }, {
            title: '关联文件',
            path: '/namespaceExcel'
        }]
    },
    '/greenNet': {
        activeName: 'greenNet',
        list: [{
            title: '首页',
            path: ''
        }, {
            title: '禁用语',
            path: '/greenNet'
        }]
    },
    '/system': {
        activeName: 'system',
        list: [{
            title: '首页',
            path: ''
        }, {
            title: '系统配置',
            path: '/system'
        }]
    },
	'/greenNetHistory': {
	    activeName: 'greenNetHistory',
	    list: [{
	        title: '首页',
	        path: ''
	    }, {
	        title: '禁用语',
	        path: '/greenNet'
	    }, {
	        title: '禁用语历史',
	        path: '/greenNetHistory'
	    }]
	}
}