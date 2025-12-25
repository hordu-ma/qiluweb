<template>
    <div class="head">
        <!-- <div class="fLeft logo translate-logo"></div>
        <el-select v-model="workspaceId" @change="workspaceChange($event)"  placeholder="请选择" style="width: 120px;padding-top: 20px;">
          <el-option
              v-for="item in workspaceData"
              :key="item.workspaceId"
              :label="item.name"
              :value="item.workspaceId"
          >
          </el-option>
        </el-select> -->

        <el-popover
          popper-class="login-info-popover"
          placement="bottom-end"
          width="122"
          :visible-arrow="false"
          v-model="visible">
          <el-button type="text" @click="logout">退出登录</el-button>
          <div class="fRight login-info"  slot="reference">
            <img src="../images/defalult-head.png" class="user-head"></img>
            <span class="user-name">{{userName}}</span>
        </div>
        </el-popover>


    </div>
</template>

<style lang="less" scoped>
    .head {
        width: 100%;
        height: 52px;
        // background-image: url('../images/notice-list-head-bg.png');
        // background-size: cover;
        .logo {
            height: 52px;
            width: 150px;
            background-size: 160%;
            background-position: center;
            position: relative;
            z-index: 999;
            // margin-left: 20px;
        }
        .login-info {
            height: 52px;
            line-height: 52px;
            font-size: 20px;
            font-family: "Micorsoft YaHei";
            .user-name {
                position: relative;
                padding-right: 15px;
                &:after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 80%;
                    right: 4px;
                    transform: translateY(-50%);
                    width: 8px;
                    height: 8px;
                    background: linear-gradient(to bottom right, transparent 0%, transparent 50%, #000 50%, #000 100%);
                    cursor: pointer;
                }
            }
            padding-right: 26px;
            .user-head {
                width: 24px;
                height: 24px;
                vertical-align: middle;
                margin-top: -2px;
                margin-right: 8px;
            }
            .user-name {
                color: #000;
                margin-right: 10px;
                cursor: pointer;
            }
            .modify-pwd{
                color: #000;
                font-size: 20px;
                margin-right: 30px;
                cursor: pointer;
            }
            .logo-out {
                color: #ffeb42;
                font-size: 18px;
                margin-right: 40px;
                cursor: pointer;
            }
        }
    }

</style>

<script>
import Util from '../libs/util';

export default {
    data () {
        return {
          visible:false,
          workspaceData:[{name:"测试空间",workspaceId:"5cf575d2622848e5b8d5f32399372d04"},{name:"生产空间",workspaceId:"7b12284b2ede412cadc1f53ee4bc612e"},{name:"开发空间",workspaceId:"94ef8d928b9d45df8e58c3d115f84362"}],
          workspaceId:'',
            userName: '',
            userInfo: null
        }
    },
  created() {
    // this.queryWorkspaceList();
    this.workspaceId = Util.getSession('workspaceId') == null?'94ef8d928b9d45df8e58c3d115f84362':Util.getSession('workspaceId') ;
    Util.setSession('workspaceId', this.workspaceId);
  },
    methods: {
      workspaceChange(workspaceId){
        Util.setSession('workspaceId', workspaceId);
        window.location.reload();
      },
        logout(){
            this.Util.removeSession('tmp_login_user');
            this.setOperatorId('');
            this.$router.push('login');
        },
      //查询工作空间
      queryWorkspaceList() {
        this.axios.queryWorkspaceList().then(data => {
          if (data.data.code == '0') {
              this.workspaceData = data.data.data;
          } else {
            this.$Modal.error({
              'title': '获取失败',
              'content': '获取工作空间失败'
            });
          }
        }).catch(error => {
          console.log("error: ", error)
          this.$Modal.error({
            'title': '获取失败',
            'content': '获取工作空间失败'
          });
        });
      }
    },
    mounted () {
        this.userName = this.Util.getSession('tmp_login_user').userName
    }
}
</script>
<style>
.el-input__inner{
  height: 28px !important;
}
.el-input__suffix{
  height: 35px !important;
}
.login-info-popover {
  height: 32px;
  min-width: 122px;
  padding: 0;
  margin-top: -10px !important;
  left: unset !important;
  right: 26px !important;
  margin-left: -70px;
  box-shadow: 0px 3px 7px 0px rgba(16,165,147,0.21);
  border-radius: 8px;
  text-align: center;
  line-height: 32px;
  .el-button--text {
    padding: 0;
    font-size: 14px;
    color: #999;
    line-height: 20px;
    text-shadow: 0px 3px 7px rgba(16,165,147,0.21);
  }
}
.login-info-popover .el-popper[x-placement^=bottom] .popper__arrow::after {
  display: none;
}
</style>
