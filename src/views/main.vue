<template>
    <div class="main-title">
        <div>欢迎使用AI助手管理后台</div>
    </div>
</template>
<script >
export default {
    name: 'Main',
    data() {
        return {
            // 这里可以定义一些数据
        };
    },
    methods: {
        // 这里可以定义一些方法
        logout() {
            // 退出登录逻辑
            console.log('退出登录');
            this.axios.logout().then(response => {
                console.log('退出登录响应:', response);
                if (response?.data?.success) {
                    this.Util.removeSession('tmp_login_user');
                    this.setOperatorId('');
                    this.$router.replace('login');
                } else {
                    this.$message.error('退出登录失败');
                }
            }).catch(error => {
                console.error('退出登录错误:', error);
                this.$message.error('退出登录失败，请稍后再试');
            });
        }
    },
    mounted() {
        // 组件挂载后执行的逻辑
    }
};
</script>
<style lang="less" scoped>
    .main-title {
        height: 100%;
        font-size:38px;
        display:flex;
        align-items: center;
        justify-content: center;
    }
</style>
