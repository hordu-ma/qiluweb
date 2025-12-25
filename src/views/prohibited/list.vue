<template>
	<div class="main-page prohibited-list">
		<Drawer :title="TreeText" :closable="false" v-model="value" width="50">
				<div>
					<Form ref="prohibitedForm" :model="form" :rules="ruleForm" :label-width="110">
						<FormItem label="名称" prop="sence" :label-width="wid" required >
						  <Input v-model="form.sence" placeholder="请输入名称" v-bind:disabled= "isDisabled" clearable/>
						</FormItem>
						<FormItem label="禁用语" prop="prohibited" :label-width="wid" required >
						  <Input v-model="form.prohibited" placeholder="请输入禁用语" v-bind:disabled= "isDisabled" clearable/>
						</FormItem>
						<FormItem label="规则类型" prop="ruleType" :label-width="wid" required >
						  <Select v-model="form.ruleType" @on-change="handleSelectChange" v-bind:disabled= "isDisabled">
							<Option v-for="(item,index) in ruleTypeData" :key="item.val" :value="item.val" >{{item.name}}</Option>
						  </Select>
						</FormItem>
						<FormItem label="正则表达式" :label-width="wid" v-show="form.ruleType === '0'?true:false">
						  <Input v-model="form.regularExpression" placeholder="请输入正则表达式" v-bind:disabled= "isDisabled" clearable/>
						</FormItem>
						<FormItem label="禁用语替换" prop="replacement" :label-width="wid" required>
						  <Input v-model="form.replacement" placeholder="请输入替换之后的内容" v-bind:disabled= "isDisabled" clearable/>
						</FormItem>
					</Form>
					<div slot="footer" style="padding-bottom: 18px;">
					  <Button type="primary" size="large" @click="cancelForm('prohibitedForm')">取消</Button>
					  <Button size="large" @click="submitForm('prohibitedForm')" v-if="TreeText!='详情'">确认</Button>
					</div>
				</div>
			</Drawer>
		<Tabs value="name1" style="background-color: white; padding-top: 20px">
				<TabPane label="禁用语查询" name="name1" >
					<div class="search-area">
						<div class="search-item">
							名称：<Input class="item-input" v-model="page.param.sence" placeholder="名称搜索" style="width:150px" maxlength="50" clearable/>
						</div>
						<div class="search-item">
							禁用语：<Input class="item-input" v-model="page.param.prohibited" placeholder="禁用语搜索" style="width:150px" maxlength="50" clearable/>
						</div>
						<div class="search-item">
							<Button icon="ios-search" type="primary" class="addNew" @click="search()">搜索</Button>
						</div>
						<div class="search-item">	
							<Button icon="md-add-circle" type="primary" class="addNew" @click="add()">新建规则</Button>
						</div>
					</div>
					<Content>
						<Table stripe border :columns="columns" :data="page.data">
							<template #name="{ row }">
							  {{ row.name }}<br>{{ row.journeyId }}
							</template>
							<template slot-scope="{ row, index }" slot="action">
								<!-- <Button type="primary" size="small" @click="history(row, index)" >历史</Button> -->
							  <Button type="primary" size="small" @click="details(row, index)" >详情</Button>
							  <!-- <Button  type="primary" size="small" @click="edit(row, index)">修改</Button>
							  <Button type="primary" size="small" @click="deleteData(row, index)">删除</Button> -->
							  <Dropdown trigger="click" :transfer="true">
								  <a href="javascript:void(0)">
								    更多
								    <Icon type="ios-arrow-down"></Icon>
								  </a>
								  <template #list>
									  <DropdownMenu>
										  <DropdownItem @click.native="history(row, index)">历史</DropdownItem>
										  <DropdownItem @click.native="edit(row, index)">修改</DropdownItem>
										  <DropdownItem @click.native="deleteData(row, index)">删除</DropdownItem>
									  </DropdownMenu>
								  </template>
							  </Dropdown>
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
				<TabPane label="禁用语历史" name="name2" >
					<div class="search-area">
						<div class="search-item">
							名称：<Input class="item-input" v-model="historyPage.param.sence" placeholder="禁用语搜索" style="width:150px" maxlength="50" clearable/>
						</div>
						<div class="search-item">
							禁用语：<Input class="item-input" v-model="historyPage.param.prohibited" placeholder="禁用语搜索" style="width:150px" maxlength="50" clearable/>
						</div>
						<div class="search-item">
							<Button icon="ios-search" type="primary" class="addNew" @click="searchHistory()">搜索</Button>
						</div>
					</div>
					<Content>
						<Table stripe border :columns="historyColumns" :data="historyPage.data">
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
							:page-size="historyPage.pageSize"
							:total="historyPage.total"
							@on-change="changeHistoryPage"
							@on-page-size-change="changeHistoryPageSize"
							/>
					</Footer>
				</TabPane>
			</Tabs>	
		</div>
	</div>
</template>

<script>
	import dataStatusList from "../../libs/dataStatus";
	import Util from '../../libs/util';
	import axios from '../../libs/axiosInterceptor.js';
	
	export default{
		data(){
			return{
				historyColumns:[
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
				ruleForm: {
					sence:[
						{required: true,message:'请输入名称',trigger:'blur'},
						{required: true,message:'请输入名称',trigger:'change'}
					],
					prohibited:[
						{required: true,message:'请输入禁用语',trigger:'blur'},
						{required: true,message:'请输入禁用语',trigger:'change'}
					],
					ruleType:[
						{required: true,type:'number',message:'请选择规则类型',trigger:'blur'},
						{required: true,type:'number',message:'请选择规则类型',trigger:'change'}
					],
					replacement:[
						{required: true,message:'请输入替换内容',trigger:'blur'},
						{required: true,message:'请输入替换内容',trigger:'change'}
					],
				},
				ruleTypeData:[
					{name:"正则表达式",val:'0'},
					{name:"直接替换",val:'1'},
				],
				wid:140,
				isDisabled: true,
				form:{
					sence:'',
					prohibited:'',
					ruleType:'',
					regularExpression:'',
					replacement:'',
					sence:''
					},
				value:false,
				TreeText:'新增',
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
					    key: "updator",
					    minWidth: 100,
					    render: (h, params) => {
					      return h("span", {}, params.row.updator);
					    },
					},
					{
					    title: "操作时间",
					    key: "updateTime",
					    minWidth: 120,
					    render: (h, params) => {
					      return h("span", {}, params.row.updateTime);
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
				    param:{prohibited: ""}
				},
				historyPage:{
				    data: [],
				    total: 0,
				    pageSize: 10,
				    pageNum: 1,
				    param:{prohibited: ""}
				},
			}
		},
		mounted(){
			this.list(1);
			this.listHistory(1);
		},
		methods:{
			rollBack(row, index){
				let that = this;
				let truthBeTold = window.confirm("确定要回滚吗？")
				if (truthBeTold) {
					let param = {
						ruleVersion: row.ruleVersion
					};
					that.axios.rollbackProhibitedHistory(param).then(data =>{
						if(data.data.code = '0'){
							that.listHistory();
							that.list();
							that.$Modal.success({'title': '提示', 'content': '操作成功',});
						}
					}).catch(error =>{
						that.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
					});
				}
			},
			changeHistoryPage(index) {
			  this.historyPage.pageNum = index;
			  this.listHistory(this.historyPage.pageNum);
			},
			changeHistoryPageSize(pageSize) {
			  this.historyPage.pageSize= pageSize;
			  this.listHistory(this.historyPage.pageNum);
			},
			listHistory(pageNum){
			    if(pageNum!=='' && pageNum!==null&& pageNum!==undefined){
			      this.historyPage.pageNum=pageNum;
			    }
			      let param = this.historyPage;
			      this.Util.trimRequstObj(param);
			      this.axios.listProhibitedHistory(param).then(data => {
			          if (data.data.code == '0') {
			              this.historyPage.data = data.data.data.data;
			              this.historyPage.total = data.data.data.total;
			
			          } else {
			              this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
			          }
			      }).catch(error => {
			          console.log("error: ", error)
			          this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
			      });
			  },
			searchHistory(){
				this.listHistory(1);
			},
			handleSelectChange(value){
				this.$forceUpdate();
			},
			history(row, index){
				let that = this;
				if(row.id){
					that.$router.push({path:'/greenNetHistory',query:{id:row.id}});
				}
			},
			deleteData(row, index) {
			  console.log(row)
			  let _this = this;
			  var truthBeTold = window.confirm("确定要删除吗？")
			  if (truthBeTold) {
			    let param = { id: row.id }
			    this.axios.deleteProhibited(param).then(data => {
			      if (data.data.code == '0') {
			        _this.list(_this.page.pageNum);
			        _this.$Modal.success({ 'title': '提示', 'content': '操作成功', });
			      } else {
			        this.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
			      }
			    })
			  }
			},
			edit(row, index) {
			  this.TreeText = '编辑';
			  this.form = row;
			  this.form = JSON.parse(JSON.stringify(row));
			  this.value = true;
			  this.isDisabled = false;
			},
			details(row, index){
				this.TreeText = '详情';
				this.form = JSON.parse(JSON.stringify(row));
				this.value = true;
				this.isDisabled = true;
			},
			validataForm() {
				let _result = true;
				let that = this;
				if(that.form.sence.length == 0){
					that.showViewMessage('请输入名称');
					_result = false;
					return;
				}
				if(that.form.prohibited.length == 0){
					that.showViewMessage('请输入禁用语');
					_result = false;
					return;
				}
				if(that.form.ruleType == undefined){
					that.showViewMessage('请选择规则类型');
					_result = false;
					return;
				}
				if(that.form.replacement.length == 0){
					that.showViewMessage('请输入替换之后的内容');
					_result = false;
					return;
				}
				return _result;
			},
			submitForm() {
			  if (this.validataForm()) {
			    let param = this.form;
			    let that = this;
			    if (this.TreeText == '新增') {
			      this.axios.saveProhibited(param).then(function (data) {
			        if (data.data.code == '0') {
			          that.value = false;
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
			      this.axios.updateProhibited(param).then(function (data) {
			        if (data.data.code == '0') {
			          that.value = false;
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
			cancelForm(name){
				this.value = false;
			},
			changePage(index) {
			  this.page.pageNum = index;
			  this.list(this.page.pageNum);
			},
			changePageSize(pageSize) {
			  this.page.pageSize= pageSize;
			  this.list(this.page.pageNum);
			},
			add(){
				this.TreeText = '新增';
				this.value = true;
				this.isDisabled = false;
				this.$refs['prohibitedForm'].resetFields();
				this.form = {};
				this.form.sence = '';
				this.form.prohibited = '';	
				this.form.ruleType = '';
				this.form.replacement = '';
			},
			search(){
				this.list(1);
			},
			list(pageNum){
			    if(pageNum!=='' && pageNum!==null&& pageNum!==undefined){
			      this.page.pageNum=pageNum;
			    }
			      let param = this.page;
			      this.Util.trimRequstObj(param);
			      this.axios.listProhibited(param).then(data => {
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
		}
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

.prohibited-list {
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
