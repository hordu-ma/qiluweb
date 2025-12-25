<template>
  <div class="main-page customer-order">
	  <div style="padding: 20px 20px 20px 10px">
	    <div class="action-container">
	      <div class="action-card">
			  <div class="action-card-item">
			    <div class="action-card-item-title">
			      <Tooltip content="聊天机器人主从类型:主类型，从类型" placement="top-start" max-width="300">
			        聊天记录
			        <Icon type="ios-help" />
			      </Tooltip>
			    </div>
			    <div class="action-card-item-text">
			      <span>全部记录</span>
			    </div>
			  </div>
	        <div class="action-card-item">
	          <div class="action-card-item-title">
	            <Tooltip content="全部回答生成次数" placement="top-start" max-width="300">
	              回答生成次数	
	              <Icon type="ios-help" />
	            </Tooltip>
	          </div>
	          <div class="action-card-item-text">
	            <span>{{sumHistoryCount.historyCount}}</span>
	          </div>
	        </div>
	        <div class="action-card-item">
	          <div class="action-card-item-title">
	            <Tooltip content="全部发送点击数" placement="top-start" max-width="300">
	              发送点击数
	              <Icon type="ios-help" />
	            </Tooltip>
	          </div>
	          <div class="action-card-item-text">
	            <span>{{sumHistoryCount.sendCount}}</span>
	          </div>
	        </div>
	        <div class="action-card-item">
	          <div class="action-card-item-title">
	            <Tooltip content="全部点赞数" placement="top-start" max-width="300">
	              点赞数
	              <Icon type="ios-help" />
	            </Tooltip>
	          </div>
	          <div class="action-card-item-text">
	            <span>{{sumHistoryCount.answerLikeUpperCount}}</span>
	          </div>
	        </div>
	        <div class="action-card-item">
	          <div class="action-card-item-title">
	            <Tooltip content="全部点踩数" placement="top-start" max-width="300">
	              点踩数
	              <Icon type="ios-help" />
	            </Tooltip>
	          </div>
	          <div class="action-card-item-text">
	            <span>{{sumHistoryCount.answerLikeLowerCount}}</span>
	          </div>
	        </div>
	        <div class="action-card-item">
	          <div class="action-card-item-title">
	            <Tooltip content="全部评论条数" placement="top-start" max-width="300">
	              评论条数
	              <Icon type="ios-help" />
	            </Tooltip>
	          </div>
	          <div class="action-card-item-text">
	            <span>{{sumHistoryCount.commentCount}}</span>
	          </div>
	        </div>
	      </div>
	    </div>
	  </div>
    <Layout>
      <Layout>
		  <Tabs value="name1" style="background-color: white;">
		    <TabPane label="历史聊天记录" name="name1">
		
				<div class="search-area">
				  <div class="search-item">
					日期&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<DatePicker :model-value="selectDateRange" type="daterange" @on-change="getDate" format="yyyy-MM-dd" placeholder="Select date" style="width: 200px"></DatePicker>
					<Button icon="  ios-search" type="primary" class="addNew" @click="search()">搜索</Button>
					</div>
				</div>
        
        <Content>
          <!-- <Row>
            <Col span="4">回答生成次数:{{sumHistoryCount.historyCount}}</Col>
            <Col span="4">发送点击数:{{sumHistoryCount.sendCount}}</Col>
            <Col span="4">点赞数:{{sumHistoryCount.answerLikeUpperCount}}</Col>
            <Col span="4">点踩数:{{sumHistoryCount.answerLikeLowerCount}}</Col>
            <Col span="4">评论条数:{{sumHistoryCount.commentCount}}</Col>
            <Col span="4">（默认显示总数）</Col>
          </Row> -->
          <Table stripe border :columns="columns" :data="page.data">
            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" @click="details(row, index)" >查看详细</Button>
            </template>
          </Table>
		  </Content>
		  
          <Footer>
            <Page
                show-sizer
                show-total
                :page-size="page.pageSize"
                :total="page.total"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
            />
        </Footer>
		</TabPane>
		</Tabs>
	  </Layout>
    </Layout>

  </div>
</template>

<script>
    import dataStatusList from "../../libs/dataStatus";
    import Util from '../../libs/util';
	import axios from '../../libs/axiosInterceptor.js';

    export default {
        data() {
            return {
              namespaceData:[{"name":"AAAA知识库",id:"AAAAA"},{"name":"BBBBB知识库",id:"BBBB"}],
              selectDateRange: ['', ''],
              sumHistoryCount:{
                historyCount: 0,
                sendCount: 0,
                answerLikeUpperCount: 0,
                answerLikeLowerCount: 0,
                commentCount: 0
              },
              useTypeData:[{"name":"公域(Prompt)",val:1},{"name":"私域(本地知识)",val:0}],
                TreeText:'新增',
                formShowFlag:false,
                groupDate:'',
                form:{name:'',useType:1},
                columns: [
                    {
                      type: "index",
                      width: 50,
                      align: "",
                    },
                  {
                    title: "日期",
                    key: "groupDate",
                    

                    render: (h, params) => {
                      return h("span", {}, params.row.groupDate);
                    },
                  },
                    {
                        title: "回答生成次数",
                        key: "historyCount",
                        sortable: true,
                        render: (h, params) => {
                          return h("span", {}, params.row.historyCount);
                        },
                    },
                  {
                    title: "发送次数",
                    key: "sendCount",
                    sortable: true,
                    render: (h, params) => {
                      return h("span", {}, params.row.sendCount);
                    }
                  },
                    {
                        title: "点赞次数",
                        key: "answerLikeUpperCount",
                      sortable: true,
                      render: (h, params) => {
                        return h("span", {}, params.row.answerLikeUpperCount);
                      }
                    },
                  {
                    title: "点踩次数",
                    key: "answerLikeLowerCount",
                    sortable: true,
                    render: (h, params) => {
                      return h("span", {}, params.row.answerLikeLowerCount);
                    }
                  },
                  {
                    title: "评论条数",
                    key: "commentCount",
                    sortable: true,
                    render: (h, params) => {
                      return h("span", {}, params.row.commentCount);
                    }
                  },
                    {
                        title: "评论详情",
                        key: "operate",
                        align: "center",
                        slot: "action",
                        fixed: "right",
                    },
                ],
                page:{
                    data: [],
                    total: 0,
                    pageSize: 10,
                    pageNum: 1,
                    startDate:'',
                    endDate:'',
                    param:{name: ""}
                }
            };
        },
        mounted() {
			// let code2 = localStorage.getItem('code');
			// console.log('code2:' + code2);
          this.list(1);
          this.sumCount();
        },
        methods: {
            sumCount(){
              let that = this;
              this.axios.sumCount().then(function (data){
                that.sumHistoryCount = data.data.data;
                if (data.data.code === '0') {
                  that.formShowFlag=false;
                  // window.location.reload()
                } else {
                  that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
                }
              }).catch(function (error) {
                console.log("error: ", error);
                that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
              });
            },
            getDate(dateSelect){
              this.selectDateRange = dateSelect;
            },
            fromVisibelChange(){
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
            details(row, index) {
                let param = row;
                let that = this;
                this.axios.selectGroupByIdHistoryCount(param).then(function (data) {
                  let groupDate = data.data.data.groupDate;
                  if (data.data.code === '0') {
                    that.formShowFlag=false;
                    // window.location.reload()
                  } else {
                    that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
                  }
                  that.$router.push({path:'/chatHistory',query:{groupDate:groupDate}});
                }).catch(function (error) {
                  console.log("error: ", error);
                  that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
                });

            },
          search() {
              this.page.startDate = '';
              this.page.endDate = '';
              if (this.selectDateRange.at(0) !== '' && this.selectDateRange.at(0) !== '' ){
                this.page.startDate = this.selectDateRange.at(0)+" 00:00:00";
                console.log("date:" +this.selectDateRange.at(0)+" 00:00:00");
                this.page.endDate = this.selectDateRange.at(1)+" 00:00:00";
              }
              this.list(1);
          },
          changePage(index) {
            this.page.pageNum = index;
            this.list(this.page.pageNum);
          },
          changePageSize(pageSize) {
            this.page.pageSize= pageSize;
            this.list(this.page.pageNum);
          },
          list(pageNum){
              if(pageNum!=='' && pageNum!==null&& pageNum!==undefined){
                this.page.pageNum=pageNum;
              }
                let param = this.page;
                this.Util.trimRequstObj(param);
                this.axios.listHistoryCount(param).then(data => {
                    if (data.data.code == '0') {
                        this.page.data = data.data.data.data;
                        this.page.total = data.data.data.total;

                    } else {
                        this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
                    }
                }).catch(error => {
                    console.log("error: ", error)
                    this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
                });
            },
        },
        watch: {
            $route(newValue, oldValue) {
                this.list(1);
            },
        },
    };
</script>

<style lang="less">
.ivu-table-cell{
  padding-left: 18px;
  padding-right: 1px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  box-sizing: border-box;
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

  .action-background {
    background: #f7f8fc;
  }

  .customer-order {
    width: 100%;
    overflow: auto;
    .addNew {
      display: inline-block;
      margin: 10px 0 10px 20px;
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
    .search-area {
      display: inline-block;
      .search-item {
        display: inline-block;
        margin-left: 10px;
        .item-input {
          display: inline-block;
          width: 200px;
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
