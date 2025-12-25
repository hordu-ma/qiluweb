<template>
  <div class="app-container">
    <div class="adminHeard">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label=""  prop="userName">
          <!-- <el-select    popper-class="custom-select"  v-model="queryParams.userName" placeholder="用户名"  multiple>
            <el-option label="医疗助手" value="v1"> </el-option>
            <el-option label="诊断报告" value="v2"></el-option>
            <el-option label="诊断测试" value="v3"></el-option>
          </el-select> -->
          <el-select
            v-model="queryParams.userId"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="请输入用户名后选择"
            :remote-method="querUsers"
            :loading="loadingName">
            <el-option
              v-for="item in nameOption"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="keyword">
          <el-input
            v-model="queryParams.param.keyword"
            placeholder="提问关键词"
            clearable
            @keyup.enter.native="handleQuery"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="创建日期" prop="createTime">
          <el-date-picker
            popper-class="custom-date-range"
            v-model="queryParams.createTime"
            type="daterange"
            start-placeholder="开始日期"
            :picker-options="pickerOptions"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label=""  prop="botIds">
          <!-- <el-select    popper-class="custom-select"  v-model="queryParams.botName" placeholder="所有智能体"  multiple>
            <el-option label="医疗助手" value="v1"> </el-option>
            <el-option label="诊断报告" value="v2"></el-option>
            <el-option label="诊断测试" value="v3"></el-option>
          </el-select> -->
          <el-select
            v-model="queryParams.botIds"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="请输入智能体名称后选择"
            :remote-method="queryBot"
            :loading="loadingBot">
            <el-option
              v-for="item in botOption"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>


        </el-form-item>
        <el-button type="primary"  style="margin-top:2px;width: 90px;" size="mini" @click="handleSearch">查询</el-button>
      </el-form>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            style="width: 90px"
            size="mini"
            type="primary"
            :disabled="historyLoading"
            @click="handleExport"
          >导出</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            size="mini"
            style="width: 90px"
            :disabled="multiple"
            @click="handleDelete">删除
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div v-if="typeList.length">
      <el-table
        v-loading="loading"
        :data="typeList"
        :max-height="600"
        @selection-change="handleSelectionChange"
        border :header-cell-style="{ backgroundColor: '#f2f5fa',  }"	>
        <el-table-column type="selection" width="80" align="center"/>
        <el-table-column label="姓名"  prop="name"/>
        <el-table-column label="账号"  prop="userName" />
        <el-table-column label="智能体"  prop="botName" />
        <el-table-column label="创建时间"  prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提问内容"  prop="question" :show-overflow-tooltip="true"/>
        <el-table-column label="回答内容"  prop="answer" :show-overflow-tooltip="true"/>
        <el-table-column label="操作"  class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <span class="btn-box" @click="handleDetail(scope.row)">
              <el-link class="btn-del" :underline="false" type="primary">查看详情</el-link>  
            </span>
            <span class="btn-box" @click="handleDelete(scope.row)">
              <el-link class="btn-del" :underline="false" type="primary">删除</el-link>  
            </span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        class="pagination"
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
    <el-empty  v-if="!typeList.length" description="还没有历史数据" :image="require('../../images/empty.png')">

    </el-empty>
    <DrawerModal :drawerVisible.sync="drawerVisible" :drawerProps="drawerProps" />
  </div>
</template>

<script>
import DrawerModal from './DrawerModal.vue'
import Pagination from "@/components/Pagination/index.vue"
 
export default {
  name: 'AdminList',
  components:{
    DrawerModal, Pagination
  },
  data() {
    return {
      historyLoading:false,
      botOption: [],
      nameOption: [],
      loadingBot: false,
      loadingName: false,
      loading: true,
      ids: [],
      multiple: true,
      drawerVisible:false,
      drawerProps:{},
      showSearch: true,
      dateRange: [],
      total: 0,
      typeList: [],
      botQueryParam: {
        pageNum: 1,
        pageSize: 200,
      },
      queryUserParams: {
        pageNum: 1,
        pageSize: 200,
        queryKey: '',
        queryValue: '',
        param: {},
      },
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        userName: [],
        createTime: [
          new Date(new Date().setMonth(new Date().getMonth() - 3)),
          new Date()
        ],
        botIds: '',
        param: {
          keyword: '',
        },
        botName:[],
      },
      page: {
					data: [],
					total: 0,
					pageSize: 10,
					pageNum: 1,
					queryValue: '',
					param: {}
			},
      pickerOptions:{
        onPick: ({ maxDate, minDate }) => {
          // 每次选完一个日期（开始或结束）都会触发
          this.minDate = minDate;
          this.maxDate = maxDate;
        },
        disabledDate: (time) => {
          const day = time.getTime();
          if (this.minDate) {
            const min = this.minDate.getTime();
            const maxLimit = new Date(this.minDate);
            // 设置最大时间跨度为3个月（90天）
            maxLimit.setMonth(maxLimit.getMonth() + 3);
            // 限制只能选择minDate到maxLimit之间的日期
            return day < min || day > maxLimit.getTime();
          }
          return false;
        },
      },
      minDate: null,
      maxDate: null,
      }
  },
  watch: {
  'queryParams.createTime': {
    handler(newVal) {
      if (!newVal || newVal.length === 0) {
        this.minDate = null;
        this.maxDate = null;
      }
    },
    deep: true
  }
},
  created() {
    this.getList();
    // this.queryBot();
  },
  methods: {
    queryBot(query) {
      this.loadingBot = true;
      this.botQueryParam.queryKey = query?'name':'';
      this.botQueryParam.queryValue = query?query:'';
      this.axios.listBot(this.botQueryParam).then(res => {
        console.log('listBot', res)
        if (res.data.code === '0') {
          // data.data.data
          console.log(res.data.data)
          this.botOption = res.data.data.data.map(item => ({ label: item.name, value: item.botId }));
          // 增加第一个所有智能体的选项
          // this.botOption.unshift({ label: '所有智能体', value: 'all' });
        }
      }).finally(() => {
        this.loadingBot = false;
      })
    },
    querUsers(query) {
      this.loadingName = true;
      this.queryUserParams.param.name = query || '';
      // this.queryUserParams.queryKey = query?'name':'';
      // this.queryUserParams.queryValue = query ?query:'';
      this.nameOption = [];
      this.axios.userList(this.queryUserParams).then(res => {
        console.log('userList', res)
        if (res.data.code === '0') {
          this.nameOption = res.data.data.data.map(item => ({ label: item.name, value: item.userId }));
        }
      }).finally(() => {
        this.loadingName = false;
      })
    },
    /** 查询字典类型列表 */
    // getList() {
    //   // this.loading = true
    //   // this.typeList = [
    //   //   {id:1,name:'张三1',userName:'12313132',botName:'医疗',createTime:'2025-05-26 10:09:13',question:'3333333333333',answer:'1233123'},
    //   //   {id:2,name:'张三2',userName:'12313132',botName:'医疗',createTime:'2025-05-26 10:09:13',question:'333333333',answer:'1233123'},
    //   //   {id:3,name:'张三3',userName:'12313132',botName:'医疗',createTime:'2025-05-26 10:09:13',question:'3333333333333333',answer:'1233123'},
    //   //   {id:4,name:'张三4',userName:'12313132',botName:'医疗',createTime:'2025-05-26 10:09:13',question:'3333333333333',answer:'1233123'},
    //   // ]
    //   // this.total = 4


    // },
    getList(pageObj={}) {
        this.loading = true;
        const { page = this.queryParams.pageNum, limit = this.queryParams.pageSize } = pageObj;
				if (page !== '' && page !== null && page !== undefined) {
					this.queryParams.pageNum = page;
				}
        if (limit) {
          this.queryParams.pageSize = limit;
        }
        console.log('.pageNum', this.queryParams.pageNum)

				let param = this.queryParams;
				this.Util.trimRequstObj(param);
        param.param.botIds = param.botIds && param.botIds !== 'all' ? [param.botIds] : [];
        if (param.createTime && param.createTime.length > 0) {
          const startDate = new Date(param.createTime[0]);
          startDate.setHours(0, 0, 0, 0);
          param.param.startDate = startDate.getTime();
          const endDate = new Date(param.createTime[1]);
          endDate.setHours(23, 59, 59, 999);
          param.param.endDate = endDate.getTime();
        } else {
          param.param.endDate = "";
          param.param.startDate = "";
        }
        if (param.userId) {
          param.param.userIds = [param.userId];
        }
				this.axios.list(param).then(data => {
          console.log('getList', data)
					if (data.data.code == '0') {
						this.typeList = data.data.data.data;
						this.page.total = data.data.data.total;
            this.total = (data.data.data.total ? Number(data.data.data.total) : 0);
						console.log(this.typeList);
						for (let _index = 0; _index < this.typeList.length; _index++) {
							if (this.typeList[_index].answerType === 'None') {
								this.typeList[_index].answerType = '--';
							}
							if (this.typeList[_index].groupUuid === 'None' || this.typeList[_index].groupUuid ===
								'null' || this.typeList[_index].groupUuid === '') {
								this.typeList[_index].groupUuid = '--';
							}
							if (this.typeList[_index].useMark === 'None') {
								this.typeList[_index].useMark = '--';
							}
							if (this.typeList[_index].answerLike === null) {
								this.typeList[_index].answerLike = '--';
							}
							if (this.typeList[_index].comment === 'None') {
								this.typeList[_index].comment = '--';
							}

						}
					} else {
						this.$Modal.error({
							'title': '获取失败',
							'content': '获取失败'
						});
					}
				}).catch(error => {
					console.log("error: ", error)
					this.$Modal.error({
						'title': '获取失败',
						'content': '获取失败'
					});
				}).finally(() => {
          this.loading = false;
        });
			},


    handleSearch() {
      console.log(this.queryParams)
      this.getList();
    },
    handleExport(){
      let historyDownloadParam = {};
      if (this.ids) {
        historyDownloadParam.historyIds = this.ids;
      } else {
        historyDownloadParam.endDate = this.queryParams.createTime[1];
        historyDownloadParam.startDate = this.queryParams.createTime[0];
      }
      this.historyLoading = true;


      this.axios.downloadHistroy(historyDownloadParam).then(data => {
					if (!data) {
						return
					}
					const link = document.createElement('a');
					const blob = new Blob([data.data], {
						type: 'application/vnd.ms-excel'
					});
					link.style.display = 'none';
					link.href = URL.createObjectURL(blob);
					//link.setAttribute('download', '聊天记录'+Date.now()+'.xlsx');
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}).catch(error => {
					console.log("error: ", error);
					this.$Modal.error({
						'title': '获取失败',
						'content': '获取失败'
					});
				});
 
    },
    handleDetail(row){
      this.drawerProps = row
      console.log("row====>",row)
      this.drawerVisible = true

    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      console.log("row====>",row)
      let text =  row.dictId ?  '确定删除当前信息吗?':'确定删除选中的信息吗?'
      this.$confirm(text, '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const { id, userId, botId, groupUuid, dictId } = row; // 解构出 id 和 userId
        // const data = { id, userId, botId, groupUuid, dictId }; // 构造要发送的数据对象
        const data = [ id ];
        this.axios.deleteHistory(data).then(res => {
          console.log("删除成功",res)
          this.$message({
          type: 'success',
          message: '删除成功!'
        });
        this.getList()
          
        })
      }).catch(() => {
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container{
  width: 100%;
  height: 100%;
  padding: 12px 24px;
  background-color: #ffffff;
  border-radius: 10px;
}
p{
  margin: 0px;
}
.adminHeard {
  display: flex;
  justify-content: space-between;
}
  :deep(.el-date-editor--daterange.el-input__inner) {
    max-width: 240px;
  }

.custom-select .el-select-dropdown__item {
  display: flex;
  align-items: center;
  position: relative;
  margin: 0 10px;
  padding-left: 32px !important; /* 给左边空出图标位置 */
}
.custom-select .el-select-dropdown__item{
  margin-bottom: 5px;
}
.custom-select .el-select-dropdown__item.selected {
  background-color: #4db58f !important; /* 修改选中背景色 */
  color: #fff !important;
  font-weight: 500;
  border-radius: 6px;
}
.custom-select .el-select-dropdown__item.selected::after{
  content: "";
}
/* 勾选图标样式 */
.custom-select .el-select-dropdown__item.selected::before {
  content: "\e6da";
  position: absolute;
  font-family: element-icons;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}
.custom-date-range{
  .el-date-table td.in-range div{
    background-color: #d2eae6 ;
  }
}
.pagination {
  margin-top: 20px;
}
.btn-box{
  padding-left: 12px;
  padding-right: 4px;
}
</style>
