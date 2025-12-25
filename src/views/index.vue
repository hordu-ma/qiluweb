<template>
    <div class="page-body">
<!--        <Header class="page-header"></Header>-->
        <div class="page-main" style="width: 100%;height: 100%;">
            <Menu class="fLeft left-panel" :identity="identity"></Menu>
            <div class="fLeft right-panel">
                <!-- <Header class="page-header"></Header> -->
                <!-- <Breadcrumb v-if="Breadcrumb.length > 1" class="bread-crumb">
                    <span v-for="(item,index) in Breadcrumb" :key="index">
                        <BreadcrumbItem v-if="index === Breadcrumb.length - 1 || index === 0">{{item.title}}</BreadcrumbItem>
                        <BreadcrumbItem v-else :to="item.path">{{item.title}}</BreadcrumbItem>
                    </span>
                </Breadcrumb> -->
                <div class="right-main" :class="{'no-crumb':Breadcrumb.length <= 1}">
                    <transition>
                        <router-view ></router-view>
                    </transition>
                  <div class="main-title" v-if="welcomeFlag">
                    <div>欢迎使用管理后台</div>
                  </div>
                </div>
<!--                <ICP class="right-bottom"></ICP>-->
            </div>
        </div>
    </div>
</template>
<script>
import Header from '../components/Header.vue';
import Menu from '../components/Menu.vue';
import ICP from '../components/ICP.vue';

import {breadCrumbs} from '../libs/breadCrumb.config.js';
import { eventBus } from '@/libs/eventBus.js'

let _list = [];
export default {
    components: {
        Header,
        Menu,
        ICP
    },
    data () {
        return {
          welcomeFlag:true,
            Breadcrumb: [],
            identity: ''
        }
    },
    created() {
        // Util.setSession('workspaceId', Util.getSession('workspaceId') == null?'94ef8d928b9d45df8e58c3d115f84362':Util.getSession('workspaceId') );
    },
    mounted () {
		let code = this.$route.query.code;
		let that = this;
		// code = '123456';
		// console.log('code' + code);
		// let token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InhSNC1TQk1ITGFNYjV4RU9xNDdKVjF3bU14SV9SUzI1NiIsInBpLmF0bSI6ImxwcmMifQ.eyJzY29wZSI6W10sImF1dGhvcml6YXRpb25fZGV0YWlscyI6W10sImNsaWVudF9pZCI6IjE2NmRjNTM5OTk0MjQ1N2E4ZWZmMThiNjhjOTYwN2I4IiwiaXNzIjoiaHR0cHM6Ly9mZWRlcmF0aW9uLXFhLmNvcnBuZXQ0LmNvbSIsImF1ZCI6IjE2NmRjNTM5OTk0MjQ1N2E4ZWZmMThiNjhjOTYwN2I4IiwiaW1tdXRhYmxlX2lkIjoibHplNnE4NTM5Iiwic3ViIjoibGlhbmh1YW4ueC56aHVAaGFsZW9uLmNvbSIsImNvcnBvcmF0ZW5ldHdvcmsiOiJmYWxzZSIsImdpdmVuX25hbWUiOiJMaWFuaHVhbiIsImZhbWlseV9uYW1lIjoiWmh1IiwiZW1haWwiOiJsaWFuaHVhbi54LnpodUBoYWxlb24uY29tIiwiYWRkcmVzcy5jb3VudHJ5IjoiQ04iLCJleHAiOjE3MDU2NzM1ODJ9.HlmymrtnRnrmoC7mM5AciTNTluJ3TVDIs2e9VVarZ6kgns4UGuUDIfqw8D1sjS_30M-u2Io3VF7hvGydw0ZdiWdH3OvJqB_CLK0MwAm71_SHIO_1tB0hGg3ytJ6P285i7dakk_ItaN2N75V76TvsL6R8ZQ426JeHjkNoBEFsuHNRNoIC_vEzu07u9xyoxjOa5pCz1K-wpuUEQWRpXpmjBtzO3PWpGMwbxt5fnZSC6KWgrqbClvZSQ5lQ9kmQlXhmdMvBRre8P8bfqD5xAM6ZBHFo4JChnER1l3jJji_f5i31SADPzoK5M3s9Hnpaz9ndLBdOUhuaMqvBFjLhKNopUw';
		// sessionStorage.setItem('token',token);
		//console.log('session = '+sessionStorage.getItem('token'));
		if(code){
			localStorage.setItem('code',code);
			that.getHaleonSSOToken(code);
		}else{
			//window.location.href = 'https://federation-qa.corpnet4.com/as/authorization.oauth2?client_id=166dc5399942457a8eff18b68c9607b8&response_type=code';
		}
		//that.getUserName();
		// this.$router.push('/main');

		this.updateBreadcrumb();
        let _userInfo = this.Util.getSession('tmp_login_user');
        if (_userInfo) {
            this.identity = "ADMIN";
        }
        // if (_userInfo) {
        //     this.identity = _userInfo.roleCode;
        //     this.setOperatorId(_userInfo.userId);
        // }
    },
    methods: {

		getUserName(){
			let that = this;
			that.axios.getUserName().then(function(data){
				console.log("username:"+data.data.data);

			})
		},
		getHaleonSSOToken(code){
			let that = this;
			//if(code){
				that.axios.getHaleonSSOToken(code).then(function (data){
					console.log('token='+ data.data.data.access_token)
					let token = data.data.data.access_token;
					if(token){
						sessionStorage.setItem("token",token);
					}

				})
			//}
		},
        getParamList(content) {
            let obj = {}  //创建空对象，接收截取的参数
            if (content.includes('?')) {
                let paramInfo = content.split('?')[1];
                if (paramInfo.includes('&')) {
                    let paramList = paramInfo.split('&')
                    for (let i = 0; i < paramList.length; i++) {
                        let item = paramList[i].split('=')
                        let key = item[0]
                        let value = item[1]
                        obj[key] = value
                    }
                } else {
                    let item = paramInfo.split('=')
                    let key = item[0]
                    let value = item[1]
                    obj[key] = value
                }
            }
            return obj;
        },
        updateBreadcrumb() {
          console.log("dd:"+this.$route.path);
            var _keys = Object.keys(breadCrumbs);
            let _this = this;
            _this.welcomeFlag=this.$route.path==='/'?true:false;
            let urlParam = _this.getParamList(window.location.href);
            _list = [];
            _keys.forEach(item => {
                if (_this.$route.fullPath.indexOf(item) >= 0) {
                    _list = breadCrumbs[item].list;
                     Array.isArray(_list) && _list.forEach(pItem => {
                        let pathParam = _this.getParamList(pItem.path);
                        if (Object.keys(pathParam).length == 0) {
                            return;
                        }
                        let pathCurrent = pItem.path.split('?')[0] + "?1=1"
                        var pathParamkeys = Object.keys(pathParam);
                        pathParamkeys.forEach(aItem => {
                            if (urlParam[aItem]) {
                                pathCurrent = pathCurrent + "&" + aItem + "=" + urlParam[aItem];
                            } else {
                                pathCurrent = pathCurrent + "&" + aItem + "=";
                            }
                        });
                        pItem.path = pathCurrent;
                    });
                }
             })
            this.Breadcrumb = Array.isArray(_list) ? _list : [];
        },
    },
    watch: {
        '$route': 'updateBreadcrumb'
    }
}
</script>
<style lang="less">
    .page-body {
        width: 100%;
        height: 100%;
        .page-header{
            position: relative;
            z-index: 10;
        }

        .page-main {
            height: calc(~'100%' - 60px);
            .left-panel {
                width: 185px;
                // margin-right: 10px;
                background-color: #1e4483;
                height: 100%;
                padding-top: 52px;
                position: relative;
                border-radius: 0px 8px 8px 0px;
                z-index: 9;
            }
            .right-panel {
                width: calc(~'100%' - 270px);
                height: 100%;
                .bread-crumb{
                    width: calc(~'100%' - 5px);
                    height: 30px;
                    line-height: 30px;
                    margin-left: 5px;
                    margin-top: 10px;
                }
                .right-main{
                    height: 100%;
                    &.no-crumb{
                        height: 100%;
                    }
                    // margin-bottom: 10px;
                    overflow: hidden;
                    overflow-y: auto;
                    padding: 26px;
                    background: #FFFFFF;
                }
                .right-bottom{
                    bottom: 10px;
                    color: #000;
                }
            }
        }
    }
                       .main-title {
                         height: 100%;
                         font-size:38px;
                         display:flex;
                         align-items: center;
                         justify-content: center;
                       }
</style>


