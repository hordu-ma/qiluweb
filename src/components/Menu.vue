<template>
  <Menu :theme="theme" :open-names="['1']" :width="'270px'" style="background-color: #F9FAFB;" accordion
    @on-select="toMenu">
    <MenuItem name="main">
      <i class="iconfont icon-books" style="transform: rotate(-90deg); display: inline-block;"></i>首页
    </MenuItem>
    <MenuItem name="systemBot">
      <i class="iconfont icon-wanchengtongguo"></i>智能体 
    </MenuItem>
    <MenuItem name="me">
      <i class="iconfont icon-lishijilu"></i>个人中心 
    </MenuItem>
    <MenuItem name="toNew">
      <i class="iconfont icon-lishijilu"></i>新建对话 
    </MenuItem>

    <el-input
      class="menu-search"
      placeholder="搜索会话..."
      prefix-icon="el-icon-search"
      @keyup.enter.native="onSearchGroup"
      v-model="keyword">
    </el-input>

    <el-dialog
      :visible.sync="menuShow"
      :modal="false"
      :show-close="false"
      :modal-append-to-body="false"
      custom-class="menu-dialog"
      :top="menuTop"
      width="220px">
        <div>
        <el-button size="medium" icon="el-icon-edit"  type="text" @click="editGroupName">重命名</el-button> 
      </div>
      <div>
        <el-button size="medium" icon="el-icon-delete" type="text" @click="deleteGroup">删除</el-button>
      </div>
    </el-dialog>


    <div class="menu-collapse" >
      <div class="menu-group" v-for="group in historyInfoList" :key="group.type">
        <div class="menu-title">{{group.type}}</div>
        <div class="menu-item" :class="{'menu-active': groupUuid === item.groupUuid}" v-for="item in group.children" :key="item.id" @click="selectGroup(item)">
          <template v-if="editId === item.groupUuid">
            <el-input v-model="groupName" placeholder="请输入新名称" @keyup.enter.native="updateGroupName" @keyup.esc="editId = ''" ref="editGroupNameInput" @click.native.stop />
          </template>
          <template v-else>
            <span>{{ item.groupName }}</span>
            <span class="menu-more" @click.stop="selectMore($event, item)">
              <i class="el-icon-more"></i>
            </span>
          </template>
        </div>
      </div>
    </div>

  </Menu>
</template>
<script>
import menusList from "../libs/menu.js";
import { breadCrumbs } from "../libs/breadCrumb.config.js";
import { eventBus } from '@/libs/eventBus.js'

export default {
  data() {
    return {
    };
  },
  created() {
  },
  props: {
    identity: {
      type: String,
      default: "",
    },
  },
  computed: {
    activeNames() {
      return this.historyInfoList.map(item => item.type);
    }
  },
  data() {
    return {
      menuTop: '15vh',
      menuShow: false,
      keyword: '',
		  flag:true,
      theme: "dark",
      menuList: [],
      activeName: "",
      historyInfoList: [],
      robotInfo: {},
      editId: '',
      editItem: {},
      groupName: '',
      groupUuid: '',
    };
  },
  methods: {
    deleteGroup() {
      // this.axios.deleteGroup({
      //   "id": item.id
      // }).then(res => {
      //   console.log('deleteGroup', res);
      //   this.getHistoryGroupList();
      // }).catch(err => {
      //   console.log('deleteGroup err', err);
      // })
    },
    editGroupName() {
      this.editId = this.editItem.groupUuid
      this.groupName = this.editItem.groupName;
      this.menuShow = false;
    },
    updateGroupName() {
      console.log('updateGroupName', this.editId, this.groupName);
      // 增加非空校验
      if (!this.groupName) {
        this.$message.error('请输入新名称');
        return;
      }
      // 校验不能超过30个字符
      if (this.groupName.length > 30) {
        this.$message.error('名称不能超过30个字符');
        return;
      }
      this.axios.updateGroup({
        "groupUuid": this.editId,
        "groupName": this.groupName
      }).then(res => {
        console.log('updateGroup', res);
        if (res.data.success) {
          this.$message.success('更新成功');
          this.editId = '';
          this.editGroupName = '';
          this.editItem = null
        } else {
          this.$message.error(res.data.message || '更新失败');
        }
      }).catch(err => {
        console.log('updateGroup err', err);
      })
    },
    selectMore(event, item) {
      console.log('selectMore', event);
      console.log('selectMore', event.clientY);
      this.menuTop = (event.clientY + 14)+'px';
      this.menuShow = !this.menuShow;
      this.editItem = item;
    },
    selectGroup(item) {
      console.log('selectGroup item', item)
      this.groupUuid = item.groupUuid;
      eventBus.$emit('groupUuid', item.groupUuid);
    },
    toMenu(name) {
      console.log('toMenu', name);
      if (name === 'toNew') {
        eventBus.$emit('toNew');
        return;
      }
      this.$router.push(`/${name}`);
    },
    checkIdentity(item) {
      return item.identityList.indexOf(this.identity) >= 0;
    },
    _getRobotInfo() {
      const robotInfo = this.Util.getLocal('robotInfo');
      console.log('getRobotInfo', robotInfo);
      if (robotInfo && robotInfo.id) {
        this.robotInfo = robotInfo;
        return;
      }
      this.axios.getDefaultBot().then(res => {
        console.log('getDefaultBot', res);
        this.robotInfo = res.data.data;
      });
    },
    onSearchGroup() {
      this._getHistoryGroupList(this.keyword || '');
    },
    _getHistoryGroupList(groupName="") {
      console.log('getHistoryGroupList', groupName);
      const _this = this;
      return new Promise((resolve, reject) => {
        try {
          this.axios.listGroupHistory({
            "pageNum": 1,
            "pageSize": 1000,
            "param": {
                "botId": _this.robotInfo.botId,
                "groupName": groupName
            }
          }).then((data) => {
            console.log('getHistoryGroupList:', data);
            _this.splitGoupList(data.data.data.data);
            resolve(data.data.data.data);
          }).catch(reject)
        } catch (error) {
          reject(error);
        }
      });
    },
    splitGoupList(data) {   
      console.log('splitGoupList', data);
      if (!data || data.length === 0) {
        this.historyInfoList = []
        return;
      }
      // 获取当前时间
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // 初始化分类结果
      const categorizedData = {
          today: [],
          yesterday: [],
          last7Days: [],
          last6Months: [],
          lastYear: [],
          others: []
      };

      // 遍历数据并分类
      data.forEach(item => {
          const createDate = new Date(item.createTime);
          const createDay = new Date(createDate.getFullYear(), createDate.getMonth(), createDate.getDate());
          const timeDiff = today - createDay;
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 0) {
              categorizedData.today.push(item);
          } else if (daysDiff === 1) {
              categorizedData.yesterday.push(item);
          } else if (daysDiff <= 7) {
              categorizedData.last7Days.push(item);
          } else if (daysDiff <= 180) {
              categorizedData.last6Months.push(item);
          } else if (daysDiff <= 365) {
              categorizedData.lastYear.push(item);
          } else {
              categorizedData.others.push(item);
          }
      });

      // 将分类结果转换为需要的格式
      const historyInfoList = [];
      
      if (categorizedData.today.length > 0) {
          historyInfoList.push({
              type: "今天",
              children: categorizedData.today
          });
      }
      if (categorizedData.yesterday.length > 0) {
          historyInfoList.push({
              type: "昨天",
              children: categorizedData.yesterday
          });
      }
      if (categorizedData.last7Days.length > 0) {
          historyInfoList.push({
              type: "最近7天",
              children: categorizedData.last7Days
          });
      }
      if (categorizedData.last6Months.length > 0) {
          historyInfoList.push({
              type: "最近半年",
              children: categorizedData.last6Months
          });
      }
      if (categorizedData.lastYear.length > 0) {
          historyInfoList.push({
              type: "最近一年",
              children: categorizedData.lastYear
          });
      }
      if (categorizedData.others.length > 0) {
          historyInfoList.push({
              type: "其他",
              children: categorizedData.others
          });
      }

      // 更新数据
      console.log('historyInfoList', historyInfoList)
      this.historyInfoList = historyInfoList;

      // test
      // this.groupUuid = data[0].groupUuid;
      // test
    },
  },
  mounted() {
    // this.activeName = this.$route.fullPath.substring(1, this.$route.fullPath.length);
    var _keys = Object.keys(breadCrumbs);
    let _this = this;
    _keys.forEach((key) => {
      if (_this.$route.fullPath.indexOf(key) >= 0) {
        _this.activeName = breadCrumbs[key].activeName;
      }
    });
    this._getRobotInfo();
    this._getHistoryGroupList();
  },
  watch: {
    identity(newValue, oldValue) {
      if (newValue.length > 0) {
        this.menuList = menusList.filter((e) => {
          return e.showMenu && e.identityList.indexOf(this.identity) >= 0;
        });
      }
    },
  },
};
</script>
<style scoped>
.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item,
.ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title {
  margin-left: 18px;
  margin-right: 18px;
  border-radius: 10px;
  font-size: 16px;
  color: #1E1E1E;
}

.ivu-menu-submenu-title {
  padding: 14px 20px !important;
}
.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu),
.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item:hover
{
  background-color: rgba(16,165,147,0.17);
  /* background: #10A593; */
  color: #10A593;
}
.menu-search {
  margin-left: 18px;
  margin-right: 18px;
  width: calc(100% - 36px);
}
  .menu-collapse {
    padding-left: 18px;
    padding-right: 18px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;
    max-height: 80vh; /* 设置最大高度 */
    display: flex;
    flex-direction: column;
  }
  .menu-group {
    padding-bottom: 28px;
  }
  .menu-title {
    font-size: 14px;
    color: #98A9BC;
    line-height: 20px;
  }
  .menu-item {
    width: 100%;
    height: 40px;
    padding-left: 14px;
    box-sizing: border-box;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    color: #000;
    &:hover, &.menu-active {
      background-color: #EEEFF0;
    }
  }
  .menu-more {
    padding: 4px;
    cursor: pointer;
    border-radius: 8px;
    color: #BABABA;
    &:hover {
      background-color: #ddd;
    }
  }
  .menu-dialog {
    position: 'absolute';
    left: 160px;
    z-index: 100;
    padding: 36px 15px;
    border-radius: 24px;
    box-shadow: 0 2px 14px #d0e8e6;
    background: #fff;
  }

  ::v-deep .el-dialog__header {
    padding: 0;
  }
  ::v-deep .el-dialog__body {
    padding: 0;
  }
  ::v-deep .el-dialog {
    width: 168px !important;
    height: 124px;
    margin-left: 200px;
  }
</style>
