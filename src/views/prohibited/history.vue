<template>
	<div class="main-page prohibited-history-list">
		<Tabs value="name1" style="background-color: white; padding-top: 20px">
			<TabPane label="禁用语历史" name="name1" >
				<div class="search-area">
					<div class="search-item">
						禁用语：<Input class="item-input" v-model="page.param.prohibited" placeholder="禁用语搜索" style="width:150px" maxlength="50" clearable/>
					</div>
					<div class="search-item">
						<Button icon="ios-search" type="primary" class="addNew" @click="search()">搜索</Button>
					</div>
				</div>
				<Content>
					<Table stripe border :columns="columns" :data="page.data">
						<template #name="{ row }">
						  {{ row.name }}<br>{{ row.journeyId }}
						</template>
						<template slot-scope="{ row, index }" slot="action">
						  <Button type="primary" size="small" @click="rollBack(row, index)">回滚</Button>
						</template>
					</Table>
				</Content>
				<Footer>
					<Page
						show-sizer
						show-total
						placement="top"
						:page-size="page.pageSize"
						:total="page.total"
						@on-change="changePage"
						@on-page-size-change="changePageSize"
						/>
				</Footer>
			</TabPane>
		</Tabs>
	</div>
</template>

<script>
	import dataStatusList from "../../libs/dataStatus";
	import Util from '../../libs/util';
	import axios from '../../libs/axiosInterceptor.js';
	
	export default{
		data(){
			return{
				columns:[
					{
					    type: "index",
					    width: 50,
					    align: "",
					},
					{
					    title: "名称",
					    key: "sence",
					    minWidth: 80,
					    render: (h, params) => {
					      return h("span", {}, params.row.sence);
					    },
					},
					{
					    title: "禁用语",
					    key: "prohibited",
					    minWidth: 200,
					    render: (h, params) => {
					      return h("span", {}, params.row.prohibited);
					    },
					},
					{
					    title: "正则表达式",
					    key: "regularExpression",
					    minWidth: 200,
					    render: (h, params) => {
						  let text = '--';
						  if(!params.row.regularExpression ==''){
							  text = params.row.regularExpression;
						  }
					      return h("span", {}, text);
					    },
					},
					{
					    title: "禁用语替换",
					    key: "replacement",
					    minWidth: 200,
					    render: (h, params) => {
					      return h("span", {}, params.row.replacement);
					    },
					},
					{
					    title: "操作人",
					    key: "operator",
					    minWidth: 80,
					    render: (h, params) => {
					      return h("span", {}, params.row.operator);
					    },
					},
					{
					    title: "操作时间",
					    key: "operateTime",
					    minWidth: 120,
					    render: (h, params) => {
					      return h("span", {}, params.row.updateTime);
					    },
					},
					{
					    title: "操作类型",
					    key: "operateType",
					    minWidth: 50,
					    render: (h, params) => {
							let text = '--';
							if(params.row.operateType == '0'){
								text = '新增';
							}else if(params.row.operateType == '1'){
								text = '修改';
							}else if(params.row.operateType == '2'){
								text = '删除';
							}else if(params.row.operateType == '3'){
								text = '回滚';
							}
					      return h("span", {}, text);
					    },
					},
					{
					    title: "操作",
					    key: "operate",
					    width: 120,
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
				    param:{prohibitedId: ""}
				}
			}
		},
		mounted(){
			let prohibitedId = this.$route.query.id;
			if (prohibitedId != null && prohibitedId !== ''){
				this.page.param.prohibitedId = prohibitedId;
			}
			this.list(1);
		},
		methods:{
			search(){
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
			rollBack(row, index){
				let that = this;
				let truthBeTold = window.confirm("确定要回滚吗？")
				if (truthBeTold) {
					let param = {
						ruleVersion: row.ruleVersion
					};
					that.axios.rollbackProhibitedHistory(param).then(data =>{
						if(data.data.code = '0'){
							that.list();
							that.$Modal.success({'title': '提示', 'content': '操作成功',});
						}
					}).catch(error =>{
						that.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
					});
				}
			},
			list(pageNum){
			    if(pageNum!=='' && pageNum!==null&& pageNum!==undefined){
			      this.page.pageNum=pageNum;
			    }
			      let param = this.page;
			      this.Util.trimRequstObj(param);
			      this.axios.listProhibitedHistory(param).then(data => {
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
	}
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

.prohibited-history-list {
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