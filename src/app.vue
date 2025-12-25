
<style lang="less">
    @import 'styles/common.less';
    @import 'styles/pic.less';
    @font-face {
    font-family: 'iconfont';
    src: url('./images/iconfont.woff?t=1751337461550') format('woff2'),
        url('./images/iiconfont.woff?t=1751337461550') format('woff'),
        url('./images/iiconfont.ttf?t=1751337461550') format('truetype');
    }
    .icon-wangyuanjing:before {
    content: "\e639";
    }
    .icon-xianshimima1:before {
    content: "\e611";
    }
    .icon-yincangmima:before {
    content: "\e612";
    }

</style>
<template>
    <div class="app-vue" v-cloak>
        <router-view></router-view>
    </div>
</template>
<script>
    import axios from 'axios';
    export default {
        data () {
            return {}
        },
        mounted () {
            axios.defaults.withCredentials = true;
            axios.defaults.baseURL = '/';
            // axios.defaults.timeout = 300000;
            // this.setAxiosRequestUse();
            // this.setAxiosResponseUse();
            // this.findViewByRoleCode();

        },
        beforeDestroy () {

        },
        methods: {
            findViewByRoleCode(){
                let _this = this;
                let _param = {
                    'roleCode': 'SA'
                }
                _this.axios.findViewByRoleCode(_param).then(data => {
                    console.log(data);
                }).catch(error => {
                    console.log(error);
                })
            },
            setAxiosRequestUse(){
                let _this = this;
                let _longTimeAccessList = ['api/upload', 'api/download'];
                axios.interceptors.request.use(function (config) {                    
                    if (_this.Util.getSession('tmp_access_token')) {
                        config.headers.Authorization = `Bearer ${_this.Util.getSession('tmp_access_token')}`;
                    }
                    if (_this.operatorId && _this.operatorId.length > 0) {
                        if (Object.prototype.toString.call(config.data) === '[object FormData]'){
                            config.data.append('operatorId', _this.operatorId);
                        } else {  
                            config.data.operatorId = _this.operatorId;
                        }
                    }
                    if (_longTimeAccessList.indexOf(config.url) >= 0) {
                        config.timeout = 10 * 60 * 1000;
                    } else {
                        config.timeout = 60 * 1000;
                    }
                    return config;
                }, function (err) {
                    return Promise.reject(err);
                });
            },
            setAxiosResponseUse(){
                let _this = this;
                axios.interceptors.response.use(function(res) {
                    return res.data;
                }, function(err) {
                    console.log(err)
                    let error = {"errcode":"0","errmsg":"success","errParam":null,"result":{}};
                    if(err.message.indexOf('timeout')>-1){
                        error.errmsg = '请求超时!';
                        return Promise.resolve(error)
                    }
                    if(err.message.indexOf('Network Error')>-1){
                        error.errmsg = '网络好像有点问题，请稍候再重试！!';
                        return Promise.resolve(error);
                    }
                    if (err.response.status === 401) {
                        _this.hideLoading();
                        _this.$Modal.error({
                            title: "温馨提示",
                            content: "登录信息已过期，请重新登录！",
                            onOk(){
                                setTimeout(function () {
                                    _this.Util.removeSession('tmp_login_user');
                                    _this.setOperatorId('');
                                    _this.$router.push('login');
                                }, 200);
                            }
                        });
                        return Promise.resolve(error);
                    } else {
                        return Promise.reject(err);
                    }
                });
            }
        }
    }
</script>
<style>
.app-vue {
    width: 100%;
    height: 100%;
}
.start-file-box .el-upload-dragger {
    width: 100%;
  }
.start-file-box .el-form-item__content {
    margin-left: 150px !important;
  }
.start-file-box .el-form-item__label {
    width: 150px!important;
}
.chat-messages .el-spinner-inner .path {
    stroke: #409EFF;
}
.app-vue .el-input__inner {
    border-radius: 10px;
}
.app-vue .el-button {
    border-radius: 10px;
    padding-left: 33px;
    padding-right: 33px;
}
.el-input--suffix .el-input__inner {
    padding-left: 10px;
    padding-right: 10px;
}
.el-input--prefix .el-input__inner {
    padding-left: 32px;
}

    /* table {
      border-collapse: collapse;
      margin: 16px 0;
      width: 100%;
      border: 1px solid #dfe2e5; 
    }
    table th, table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    table tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
    }
    table tr:nth-child(2n) {
      background-color: #f6f8fa;
    } */

</style>
