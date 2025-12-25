<template>
    <div class="login-main">
        <div class="body">
            <form id="login-form" action="/login" method="post" ref="loginForm">
                <div class="login-panel">
                    <div class="login-panel-title">您好， 欢迎使用</div>
                    <div class="login-panel-logo">医知立方 MediQube</div>
                    <div class="login-input-line">
                        <div class="input-line-title">学号：</div>
                        <input type="text" 
                               class="fLeft user-name-txt" 
                               name="username" 
                               id="username" 
                               :autofocus="true" 
                               placeholder="请输入学号" 
                               v-model="userName"
                               maxlength="20"
                               ref="userName"
                               autocomplete="off"
                               @input="inputUser"
                               @propertychange="inputUser"
                               @keyup.13="stageToPassword" />
                        <i v-if="userName.length > 0" 
                           class="empty-txt-icon login-icon fLeft"
                           @click="clearUserName"></i>
                    </div>
                    <div class="login-input-line password-line">
                        <div class="input-line-title">密码：</div>
                        <input :type="passwordVisible ? 'text' : 'password'"
                               class="fLeft user-name-txt"
                               name="password"
                               id="password"
                               placeholder="请输入密码"
                               v-model="password"
                               ref="password"
                               maxlength="20"
                               autocomplete="new-password"
                               @keyup.13="submitLogin">
                        </input>
                        <i v-if="password.length > 0"
                            class="empty-txt-icon login-icon fLeft"
                            @click="clearPassword"></i>
                            <i v-if="password.length > 0"
                            :class="['login-icon', 'fLeft', passwordVisible ? 'iconfont icon-yincangmima' : 'iconfont icon-xianshimima1']"
                            @click="passwordVisible = !passwordVisible"></i>
                    </div>
                    <div class="login-input-line">
                        <div class="input-line-title">手机号：</div>
                        <input type="text"
                               class="fLeft user-name-txt"
                               name="phone"
                               id="phone"
                               placeholder="请输入手机号"
                               v-model="phoneNumber"
                               maxlength="11"
                               ref="phoneNumber"
                               autocomplete="off"
                               @input="inputPhone"
                               @keyup.13="stageToVerifyCode" />
                        <i v-if="phoneNumber.length > 0"
                           class="empty-txt-icon login-icon fLeft"
                           @click="clearPhoneNumber"></i>
                    </div>
                    <div class="login-input-line">
                        <div class="input-line-title">验证码：</div>
                        <div class="verify-code-wrapper">
                            <input type="text"
                                   class="verify-code-input"
                                   name="verifyCode"
                                   id="verifyCode"
                                   placeholder="请输入验证码"
                                   v-model="verifyCode"
                                   maxlength="6"
                                   ref="verifyCode"
                                   autocomplete="off"
                                   @keyup.13="submitLogin" />
                            <i v-if="verifyCode.length > 0"
                               class="empty-txt-icon login-icon verify-code-clear-icon"
                               @click="clearVerifyCode"></i>
                            <span class="get-code-text"
                                  :class="{
                                    disabled: !canGetCode || countdown > 0,
                                    'has-clear-icon': verifyCode.length > 0
                                  }"
                                  @click="getVerifyCode">
                                {{countdown > 0 ? countdown + 's' : '点击获取验证码'}}
                            </span>
                        </div>
                    </div>
                    <div class="input-line-text"><a @click="toReset">忘记密码</a></div>
                    <div class="login-checkbox-line">
                        <el-checkbox v-model="checked" >
                            <div class="checkbox-text">
                            您同意并接受 
                            </div>
                        </el-checkbox>
                        <span class="span" @click.stop="toMarkDown('policyContent')">隐私政策</span> 和 <span  class="span" @click.stop="toMarkDown('agreementContent')">服务条款</span>
                    </div>
                    <div class="login-error" v-if="showErrorMessage">{{errorMessage}}</div>
                    <div class="login-btn-line tCenter">
                        <input type="button" class="login-btn no-user-select" value="登录" @click="submitLogin" />
                    </div>
                </div>
            </form>
        </div>
        <el-dialog
            :title="dialogTitle"
            :visible.sync="dialogVisible"
            width="50%">
            <div class="dialog-content" v-html="renderMarkdown(dialogContent)"></div>
        </el-dialog>
        <ICP></ICP>
    </div>
</template>

<script>
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import ICP from '../components/ICP.vue';
export default {
    data () {
        return {
            disclaimerData: {},
            disclaimerId: 0,
            passwordVisible: false,
            dialogVisible: false,
            dialogTitle: '',
            dialogType: '',
            dialogContent: '',
            checked: false,
            userName:'',
            password:'',
            phoneNumber: '',
            verifyCode: '',
            showErrorMessage:false,
            errorMessage: '',
            countdown: 0,
            canGetCode: false,
        }
    },
    created() {
        console.log('created:');
        this._getDisclaimer();
    },
    watch: {
        phoneNumber: {
            handler(newVal) {
                console.log('phoneNumber:', newVal);
                // 检查手机号格式是否正确（必须是11位且符合中国手机号规则）
                this.canGetCode = newVal.length === 11 && /^1[3-9]\d{9}$/.test(newVal);
            },
            immediate: true
        }
    },
    methods: {
        _getDisclaimer() {
            this.axios.getDisclaimer().then((data) => {
                console.log('getDisclaimer:', data);
                this.disclaimerId = data?.data?.data?.id || 0;
                this.disclaimerData = data?.data?.data;
            })
        },
        changePasswordType() {
            this.passwordVisible = !this.passwordVisible;
        },
        renderMarkdown(text) {
            if (!text) return ''; // 如果文本为空，返回空字符串
            // 配置marked
            const renderer = new marked.Renderer();
            renderer.paragraph = (text) => {
                return text; // 直接返回文本内容，不包裹 p 标签
            };

            marked.setOptions({
                renderer: renderer,
                highlight: function (code, language) {
                const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                return hljs.highlight(validLanguage, code).value;
                },
                pedantic: false,
                gfm: true,
                breaks: true,
                sanitize: false, // 设置为false以允许HTML标签s
                smartLists: true,
                smartypants: false,
                xhtml: false
            });

            // 渲染Markdown并返回HTML
            return marked(text);
        },
        toReset() {
            this.$router.push('/reset');
        },
        toMarkDown(type) {
            const typeToTileObj = {
                'policyContent': '隐私政策',
                'agreementContent': '服务条款',
            };
            console.log('this.disclaimerData:', this.disclaimerData);
            this.dialogType = type;
            this.dialogTitle = typeToTileObj[type];
            this.dialogContent = this.disclaimerData[type];
            this.dialogVisible = true;
        },
        clearUserName() {
            var _this = this;
            _this.userName = "";
            _this.$refs.userName.focus();
        },
        clearPassword() {
            var _this = this;
            _this.password = "";
            _this.$refs.password.focus();
        },
        clearPhoneNumber() {
            var _this = this;
            _this.phoneNumber = "";
            _this.$refs.phoneNumber.focus();
        },
        clearVerifyCode() {
            var _this = this;
            _this.verifyCode = "";
            _this.$refs.verifyCode.focus();
        },
        inputUser(){
            this.userName = this.userName.replace(/[^0-9a-zA-Z]/g,'');
        },
        inputPhone() {
            this.phoneNumber = this.phoneNumber.replace(/[^0-9]/g, '');
            // 检查手机号格式是否正确（必须是11位且符合中国手机号规则）
            this.canGetCode = this.phoneNumber.length === 11 && /^1[3-9]\d{9}$/.test(this.phoneNumber);
        },
        stageToVerifyCode(){
            var _this = this;
            if (_this.phoneNumber.trim().length === 0) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "手机号不能为空！",
                    onOk(){
                        setTimeout(function () {
                            _this.$refs.phoneNumber.focus();
                        }, 200);
                    }
                });
                return;
            }
            _this.$refs.verifyCode.focus();
        },
        getVerifyCode() {
            var _this = this;

            // 验证手机号格式
            if (!_this.canGetCode) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "请输入正确的手机号！"
                });
                return;
            }

            // // 开始倒计时
            // _this.countdown = 60;
            // var timer = setInterval(() => {
            //     _this.countdown--;
            //     if (_this.countdown <= 0) {
            //         clearInterval(timer);
            //     }
            // }, 1000);

            // // TODO: 调用发送验证码的API
            // _this.$Modal.success({
            //     title: "提示",
            //     content: "验证码已发送，请查收！"
            // });
            
             // 调用发送验证码的API
            this.axios.sendCode({
                phoneNumber: _this.phoneNumber,
            }).then(res => {
                if (res?.data?.success) {
                // 发送成功，开始倒计时
                _this.countdown = 60;
                const timer = setInterval(() => {
                    _this.countdown--;
                    if (_this.countdown <= 0) {
                    clearInterval(timer);
                    }
                }, 1000);
                    _this.$Modal.success({
                        title: "提示",
                        content: "验证码已发送，请查收！"
                    });
                } else {
                _this.$message.error(res.msg || "发送验证码失败，请重试");
                }
            }).catch(err => {
                _this.$message.error(err.message || "发送验证码失败，请重试");
            });
        },
        stageToPassword(){
            var _this = this;
            if (_this.userName.trim().length === 0) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "学号不能为空！",
                    onOk(){
                        setTimeout(function () {
                            _this.$refs.userName.focus();
                        }, 200);
                    }
                });
                return;
            }
            _this.$refs.password.focus();
        },
        async submitLogin(){
            var _this = this;
          // _this.$router.push('/main');

          if (!this.checked) {
            _this.$Modal.error({
                title: "温馨提示",
                content: "请先同意隐私政策和服务条款！",
            });
            return;
          }

            if (_this.userName.trim().length === 0) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "学号不能为空！",
                    onOk(){
                        setTimeout(function () {
                            _this.$refs.userName.focus();
                        }, 200);
                    }
                });
            } else if(_this.password.trim().length === 0) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "密码不能为空！",
                    onOk(){
                        setTimeout(function () {
                            _this.$refs.password.focus();
                        }, 200);
                    }
                });
            } else if(_this.phoneNumber.trim().length === 0) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "手机号不能为空！",
                    onOk(){
                        setTimeout(function () {
                            _this.$refs.phoneNumber.focus();
                        }, 200);
                    }
                });
            } else if(!_this.canGetCode) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "请输入正确的手机号！",
                    onOk(){
                        setTimeout(function () {
                            _this.$refs.phoneNumber.focus();
                        }, 200);
                    }
                });
            } else if(_this.verifyCode.trim().length === 0) {
                _this.$Modal.error({
                    title: "温馨提示",
                    content: "验证码不能为空！",
                    onOk(){
                        setTimeout(function () {
                            _this.$refs.verifyCode.focus();
                        }, 200);
                    }
                });
            } else {
                let _param = {
                    account: _this.userName,
                    password: _this.password,
                    phoneNumber: _this.phoneNumber,
                    smsCode: _this.verifyCode
                }
                _this.showLoading('登录中.....');
                try {
                    const data = await _this.axios.passwordAndSmsLogin(_param);

                    if (data.status === 200 && data.data.success) {
                        console.log('passwordAndSmsLogin:', data);
                        _this.Util.setSession('tmp_login_user', {
                            userName: _this.userName
                        });
                        _this.Util.setSession('tmp_access_token', data.data.data);

                        const res = await _this.axios.saveDisclaimer({ disclaimerId: this.disclaimerId });
                        if(res.data.success) {
                            const authRes = await _this.axios.getAuthCode();
                            _this.hideLoading();
                            // 检查是否有 redirectUri 查询参数
                            const redirectUri = _this.$route.query.redirectUri;
                            // 如果有 redirectUri，直接跳转到该地址 + token
                            if (redirectUri && authRes.data.data) {
                                const url = new URL(redirectUri);
                                const token = authRes.data.data
                                url.searchParams.set("token", token || "");
                                window.location.href = url.toString();
                            } else {
                                _this.$router.push('/main');
                            }
                        }
                    } else {
                        _this.$Modal.error({
                            'title': '登录失败',
                            'content': data.data.message || '学号、密码或验证码错误'
                        });
                        _this.hideLoading();
                    }
                } catch (error) {
                    _this.$Modal.error({
                        'title': '登录失败',
                        'content': '学号、密码或验证码错误'
                    });
                    _this.hideLoading();
                }
            }
        }
    },
    mounted () {
        
    },
    watch: {
        
    },
    components: {
        ICP
    }
}
</script>

<style lang="less">
 @import url('../styles/views/login.less');
</style>
<style lang="less" scoped>
    ::v-deep .el-dialog {
        margin-top: 10vh !important;
        width: 50vw;
        .el-dialog__body {
            max-height: 70vh;
            overflow-y: auto;
        }
    }
</style>
