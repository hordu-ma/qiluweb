<template>
  <div class="me-content">
    <div class="avatar-box">
      <el-avatar :src="userInfo?.avatar || require('@/images/defalult-head.png')" size="large"></el-avatar>
      <span class="username">{{ userInfo?.username || '未登录' }}</span>
    </div>
    <el-menu class="menu-list" mode="vertical" :default-active="''">
      <el-menu-item
        v-for="item in menuList"
        :key="item.path"
        @click="handleMenu(item.path)"
      >
        <img :src="item.icon" class="menu-icon" />
        <span>{{ item.name }}</span>
        <i class="el-icon-arrow-right" style="float:right;color:#aaa"></i>
      </el-menu-item>
      <el-menu-item class="exit" @click="handleLogout">
        <img :src="iconExit" class="menu-icon" />
        <span style="color:#37a492;">退出登录</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import iconPrivacy from '@/images/privacy.png'
import iconProtocol from '@/images/protocol.png'
import iconReset from '@/images/reloadPassword.png'
import iconExit from '@/images/exit.png'
import defaultHead from '@/images/defalult-head.png'

export default {
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      dialogType: '',
      dialogContent: '',
      iconExit,
      defaultHead,
      userInfo: null,
      menuList: [
        {
          name: '重置密码',
          path: '/myReset',
          icon: iconReset,
        },
        {
          name: '用户协议',
          path: '/markdown?dataType=agreementContent',
          icon: iconProtocol,
        },
        {
          name: '隐私政策',
          path: '/markdown?dataType=policyContent',
          icon: iconPrivacy,
        }
      ]
    };
  },
  methods: {
    handleMenu(path) {
      this.$router.push(path);
    },
    handleLogout() {
      this.$confirm('您确定要退出登录吗？', '确认退出', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: 替换为你的登出API
        this.axios.logout().then(() => {
          this.Util.removeSession('tmp_login_user');
          this.setOperatorId('');
          this.$router.replace('login');
        });
      });
    },
    // 模拟API，实际请替换
    getLoginUserInfo() {
      // TODO: 替换为实际API
      return Promise.resolve({ username: '张三', avatar: this.defaultHead });
    },
    logout() {
      // TODO: 替换为实际API
      return Promise.resolve();
    }
  },
  mounted() {
    this.getLoginUserInfo().then(res => {
      this.userInfo = res;
    });
  }
};
</script>

<style scoped>
.me-content {
  height: 100%;
}
.nav-bar {
  background: #10A593;
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.avatar-box {
  display: flex;
  align-items: center;
  margin-top: 38px;
  margin-left: 40px;
}
.avatar-box .el-avatar {
  width: 80px;
  height: 80px;
}
.username {
  font-size: 32px;
  margin-left: 40px;
  font-weight: 600;
}
.menu-list {
  margin-top: 46px;
  width: 400px;
  background: transparent;
  border: none;
}
.menu-list .el-menu-item {
  height: 56px;
  display: flex;
  align-items: center;
  font-weight: 600;
  border-bottom: 1px solid #f5f5f5;
}
.menu-icon {
  width: 30px;
  height: 30px;
  margin-right: 20px;
}
.exit {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}
</style>