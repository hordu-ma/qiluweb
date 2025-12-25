<template>
  <div class="main-page namespace-list">
    <div style="padding: 20px 20px 20px 10px">
      <div class="action-container">
        <div class="action-card">
          <div class="action-card-item">
            <div class="action-card-item-title">
              <Tooltip content="知识库类型有长期知识库、临时知识库、预制知识库和专属知识库" placement="top-start" max-width="300">
                知识库
                <Icon type="ios-help" />
              </Tooltip>
            </div>
            <div class="action-card-item-text">
              <span>全部知识库</span>
            </div>
          </div>
          <div class="action-card-item">
            <div class="action-card-item-title">
              <Tooltip content="可共用的且长期有校的知识库" placement="top-start" max-width="300">
                长期知识库
                <Icon type="ios-help" />
              </Tooltip>
            </div>
            <div class="action-card-item-text">
              <span>{{ page.num0 }}</span>
            </div>
          </div>
          <div class="action-card-item">
            <div class="action-card-item-title">
              <Tooltip content="可共用的且临时有校的知识库" placement="top-start" max-width="300">
                临时知识库
                <Icon type="ios-help" />
              </Tooltip>
            </div>
            <div class="action-card-item-text">
              <span>{{ page.num1 }}</span>
            </div>
          </div>
          <div class="action-card-item">
            <div class="action-card-item-title">
              <Tooltip content="Q&A方式的知识库" placement="top-start" max-width="300">
                预制知识库
                <Icon type="ios-help" />
              </Tooltip>
            </div>
            <div class="action-card-item-text">
              <span>{{ page.num2 }}</span>
            </div>
          </div>
          <div class="action-card-item">
            <div class="action-card-item-title">
              <Tooltip content="仅提供单一用户使用的知识库" placement="top-start" max-width="300">
                专属知识库
                <Icon type="ios-help" />
              </Tooltip>
            </div>
            <div class="action-card-item-text">
              <span>{{ page.num3 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Tabs value="name1">
      <TabPane label="知识库列表" name="name1">
        <div class="search-area">
          <div class="search-item">
            名称：<Input class="item-input" v-model="page.param.name" style="width:150px" placeholder="知识库名称" maxlength="50"
              clearable />
          </div>
          <div class="search-item">
            标识：<Input class="item-input" v-model="page.param.namespace" style="width:150px" placeholder="知识库标识"
              maxlength="50" clearable />
          </div>
          <div class="search-item">
            类型：<Select v-model="page.param.type" style="width:150px" clearable>
              <Option v-for="item in type" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
          <div class="search-item">
            <Button icon="ios-search" type="primary" class="addNew" @click="search()">搜索</Button>
          </div>
          <div class="search-item">
            <Button icon="md-add-circle" type="primary" class="addNew" @click="add()">新建</Button>
          </div>

        </div>
        <Content>
          <Table stripe border :columns="columns" :data="page.data">
            <template #name="{ row }">
              {{ row.name }}<br>{{ row.journeyId }}
            </template>
            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" @click="details(row, index)">详情</Button>
              <Button type="primary" size="small" @click="edit(row, index)">编辑</Button>
              <Button type="primary" size="small" @click="deleteData(row, index)">删除</Button>
              <Button type="primary" size="small" @click="namespaceFile(row, index)">管理</Button>
            </template>
          </Table>
        </Content>
        <Footer>
          <Page show-sizer show-total :page-size="page.pageSize" :total="page.total" @on-change="changePage"
            @on-page-size-change="changePageSize" />
        </Footer>

        <!-- 抽屉页面 -->
        <Drawer :title="TreeText" :closable="false" v-model="bus.showFlag" width="50">
          <div>
            <Form ref="chatBotForm" :model="form" :label-width="110">
              <FormItem label="名称" required>
                <Input v-model="form.name" placeholder="请输入知识库名称" v-bind:disabled="bus.disabled" clearable />
              </FormItem>
              <FormItem label="说明">
                <Input v-model="form.remark" type="textarea" placeholder="请输入说明信息" v-bind:disabled="bus.disabled" clearable />
              </FormItem>
              <FormItem label="类型" required>
                <Select v-model="form.type" v-bind:disabled="bus.disabled">
                  <Option v-for="(item, index) in type" :key="item.value" :value="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="分片策略" required>
                <Select v-model="form.chunkStrategy" v-bind:disabled="bus.disabled">
                  <Option v-for="(item, index) in strategy" :key="item.value" :value="item.value">{{ item.label }}
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="分片长度" v-show="form.chunkStrategy === '0'" required>
                <InputNumber v-model="form.chunkSize" placeholder="" v-bind:disabled="bus.disabled" :min="0" :max="10000" number />
              </FormItem>
              <FormItem label="分片重叠值" v-show="form.chunkStrategy === '0'" required>
                <InputNumber v-model="form.chunkOverlap" placeholder="" v-bind:disabled="bus.disabled" :min="0" :max="100" number />
              </FormItem>
            </Form>
            <div slot="footer">
              <Button type="primary" size="large" @click="cancelForm('chatBotForm')">取消</Button>
              <Button size="large" @click="submitForm()" v-if="TreeText != '详情'">确认</Button>
            </div>
          </div>
        </Drawer>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bus: {
        showFlag: false, // 是否显示抽屉
        disabled: false, // 是否关闭抽屉编辑
      },
      IntegralDetail: {},
      type: [
        {
          value: 0,
          label: '长期知识库',
        },
        {
          value: 2,
          label: '预制知识库',
        },
      ],
      strategy: [
        {
          value: "0",
          label: '长度策略',
        },
        {
          value: "1",
          label: '段落策略',
        },
        {
          value: "2",
          label: '等份策略',
        },
      ],
      TreeText: '新增',
      form: { name: '' },
      columns: [
        {
          type: "index",
          width: 50,
          align: "",
        },
        {
          title: "名称",
          key: "name",
          width: 300,
        },
        {
          title: "标识",
          key: "namespace",
          width: 300,
        },
        {
          title: "类型",
          key: "type",
          width: 120,
          render: (h, params) => {
            let text = '';
            if (params.row.type == 0) { text = '长期知识库'; }
            else if (params.row.type == 1) { text = '临时知识库'; }
            else if (params.row.type == 2) { text = '预制知识库'; }
            return h("span", {}, text);
          },
        },
        {
          title: "分片策略",
          key: "chunkStrategy",
          width: 120,
          render: (h, params) => {
            let text = '--';
            if (params.row.chunkStrategy == '0') { text = '长度策略'; }
            else if (params.row.chunkStrategy == '1') { text = '段落策略'; }
            else if (params.row.chunkStrategy == '2') { text = '等份策略'; }
            return h("span", {}, text);
          }
        },
        {
          title: "分片长度",
          key: "chunkSize",
          width: 120,
        },
        {
          title: "分片重叠值",
          key: "chunkOverlap",
          width: 120,
        },
        {
          title: "说明空间",
          key: "remark",
          minWidth: 600,
          render: (h, params) => {
            return h("span", {}, params.row.remark == null ? '--' : params.row.remark);
          }
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 200,
        },
        {
          title: "创建人",
          key: "creator",
          width: 100,
        },
        {
          title: "更新时间",
          key: "updateTime",
          width: 200,
        },
        {
          title: "更新人",
          key: "updator",
          width: 100,
        },
        {
          title: "操作",
          key: "operate",
          width: 215,
          align: "center",
          slot: "action",
          fixed: "right",
        },
      ],
      page: {
        data: [],
        total: 0,
        pageSize: 10,
        pageNum: 1,
        num0: 0,
        num1: 0,
        num2: 0,
        num3: 0,
        param: { name: "", namespace: "", type: "" }
      }
    };
  },
  mounted() {
    this.list(1);
  },
  methods: {
    fromVisibelChange() {
      console.log("fromVisibelChange")
    },
    validataForm() {
      var _result = true;
      if (this.form.name.length == 0) {
        this.showViewMessage('请输入工作空间名称');
        _result = false;
        return;
      }
      return _result;
    },
    // 新建知识库
    submitForm() {
      if (this.validataForm()) {
        let param = this.form;
        let that = this;
        if (this.TreeText == '新增') {
          this.axios.saveNamespace(param).then(function (data) {
            if (data.data.code == '0') {
              that.bus.showFlag = false;
              that.list();
              that.$Modal.success({ 'title': '提示', 'content': '新增成功' });
            } else {
              that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
            }
          }).catch(function (error) {
            console.log("error: ", error);
            that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
          });
        } else {
          this.axios.updateNamespace(param).then(function (data) {
            if (data.data.code == '0') {
              that.bus.showFlag = false;
              that.list();
              that.$Modal.success({ 'title': '提示', 'content': '编辑成功' });
            }
          }).catch(function (error) {
            console.log("error: ", error);
            that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
          });
        }

      }
    },
    cancelForm(name) {//取消
      this.bus.showFlag = false;
    },
    details(row, index) {
      this.TreeText = '详情';
      this.form = JSON.parse(JSON.stringify(row));
      this.bus.showFlag = true;
      this.bus.disabled = true;
    },
    add() {
      this.$refs['chatBotForm'].resetFields();
      this.TreeText = '新增';
      this.form = {};
      this.form.name = '';
      this.bus.showFlag = true;
      this.bus.disabled = false;
    },
    edit(row, index) {
      this.TreeText = '编辑';
      this.form = row;
      this.form = JSON.parse(JSON.stringify(row));
      this.bus.showFlag = true;
      this.bus.disabled = false;
    },
    deleteData(row, index) {
      console.log(row)
      let _this = this;
      var truthBeTold = window.confirm("确定要删除吗？")
      if (truthBeTold) {
        let param = { id: row.id }
        this.axios.deleteNamespace(param).then(data => {
          if (data.data.code == '0') {
            // window.location.reload();
            _this.list(_this.page.pageNum);
            _this.$Modal.success({ 'title': '提示', 'content': '操作成功', });
          } else {
            this.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
          }
        })
      }
    },
    namespaceFile(row, index) {
      this.$router.push("/namespaceFile?id=" + row.id);
    },
    search() {
      this.list(1);
    },
    changePage(index) {
      this.page.pageNum = index;
      this.list(this.page.pageNum);
    },
    changePageSize(pageSize) {
      this.page.pageSize = pageSize;
      this.list(this.page.pageNum);
    },
    list(pageNum) {
      if (pageNum !== '' && pageNum !== null && pageNum !== undefined) {
        this.page.pageNum = pageNum;
      }
      let param = this.page;
      this.Util.trimRequstObj(param);
      this.axios.listNamespace(param).then(data => {
        if (data.data.code == '0') {
          this.page.data = data.data.data.data;
          this.page.total = data.data.data.total;
          this.page.num0 = data.data.data.num0;
          this.page.num1 = data.data.data.num1;
          this.page.num2 = data.data.data.num2;
          this.page.num3 = data.data.data.num3;
        } else {
          this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
        }
      }).catch(error => {
        console.log("error: ", error)
        this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
      });
    }
  },
  watch: {
    $route(newValue, oldValue) {
      this.list(1);
    },
  },
};
</script>

<style lang="less">
.ivu-table-cell {
  padding-left: 18px;
  padding-right: 1px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  box-sizing: border-box;
}

.action-background {
  background: #f7f8fc;
}

.namespace-list {
  width: 100%;
  overflow: auto;

  .search-area {
    display: inline-block;

    .search-item {
      display: inline-block;
      margin-left: 1px;

      .item-input {
        display: inline-block;
        width: 200px;
      }
    }
  }

  .addNew {
    display: inline-block;
    margin: 10px 0 10px 10px;
  }

  .table-item {
    width: calc(~"100%" - 15px);
    margin: 0px 10px 0 5px;

    .ivu-table-cell {
      padding: 0 5px;
    }
  }

  .ivu-page {
    text-align: center;
    margin-top: 20px;
  }

  .action-container {
    display: flex;

    .action-card {
      display: flex;
      padding-top: 25px;
      padding-block: 25px;

      .action-card-item {
        height: 100px;
        width: 175px;
        border: 1px solid;
        border-radius: 6px;
        background-color: #fff;
        margin-right: 12px;
        padding: 20px 16px;

        .action-card-item-title {
          color: #848689;
        }

        .action-card-item-text {
          font-size: 24px;
          font-family: Helvetica;
          margin-top: 4px;
          color: #53555b;
        }
      }
    }

    .action-detail {
      padding: 28px 50px 28px 14px;

      .action-detail-title {
        color: #848689;
      }

      .action-detail-text {
        font-size: 18px;
      }
    }
  }
}

.setstyle {
  min-height: 200px;
  padding: 0 !important;
  margin: 0;
  overflow: auto;
  cursor: default !important;
}
</style>
