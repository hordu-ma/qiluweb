<template>
	<div class="main-page chatBot-list">
		<Drawer :title="TreeText" :closable="false" v-model="value" width="50">
			<div>
				<Form ref="chatBotForm" :model="form" :rules="ruleForm" :label-width="110">
					<FormItem label="类型" :label-width="wid" required>
						<Select v-model="form.useType" @on-change="handleSelectChange" v-bind:disabled="isDisabled">
							<Option v-for="(item,index) in useTypeData" :key="item.val" :value="item.val">{{item.name}}
							</Option>
						</Select>
					</FormItem>
					<FormItem label="名称" prop="name" :label-width="wid" required>
						<Input v-model="form.name" placeholder="请输入名称" v-bind:disabled="isDisabled" clearable />
					</FormItem>

					<FormItem label="欢迎语" :label-width="wid">
						<Input v-model="form.welcomeTip" type="textarea" placeholder="请输入欢迎语"
							v-bind:disabled="isDisabled" clearable />
					</FormItem>


					<FormItem label="提示词" prop="prompt" :label-width="wid" required>
						<Input v-model="form.prompt" :rows="15" type="textarea" v-bind:disabled="isDisabled"
							placeholder="我想让你做一个{context}我会把我的位置写给你，你会推荐一个靠近我的位置的地方。在某些情况下，我还会告诉您我将访问的地方类型。您还会向我推荐靠近我的第一个位置的类似类型的地方。我的第一个建议请求是{question}"
							clearable />
					</FormItem>

					<FormItem label="知识库" prop="namespaceId" required :label-width="wid"
						v-show="form.useType===1?false:true">
						<Select v-model="form.namespaceId" v-bind:disabled="isDisabled">
							<Option v-for="(item,index) in namespaceData" :key="item.id" :value="item.id">{{item.name}}
							</Option>
						</Select>
					</FormItem>

					<FormItem label="聊天链策略" prop="chainsChunkType" :label-width="wid" required
						v-show="form.useType===1?false:true">
						<template slot="label">
							<span>聊天链策略</span>
							<Tooltip placement="top" :transfer="true" :maxWidth="800">
								<div slot="content">
									<p>聊天链分块策略,stuff[全量交换],refine[新旧交互]</p>
								</div>
								<Icon type="md-help-circle" />
							</Tooltip>
						</template>
						<Select v-model="form.chainsChunkType" v-bind:disabled="isDisabled">
							<Option v-for="(item,index) in chainsChunkType" :key="item.value" :value="item.value">
								{{item.label}}
							</Option>
						</Select>
					</FormItem>
					<FormItem label="LLMS模型配置" :label-width="wid" required v-show="form.useType===1?false:true">
						<Cascader :data="botKnowledgeConfig" v-bind:disabled="isDisabled" v-model="botKnowledgeValue"  />
					</FormItem>
					<FormItem label="提示词前缀" :label-width="wid" required
						v-show="form.chainsChunkType==='refine'?true:false">
						<Input v-model="form.prefixPrompt" :rows="15" type="textarea" v-bind:disabled="isDisabled"
							placeholder="上下文信息如下。---------------------{context_str}---------------------给定上下文信息而不是先验知识。请按照以下格式回答问题，如:answer:1.2.3.回答以下问题: {question}"
							clearable />
					</FormItem>
					<FormItem label="主从类型" :label-width="wid" required>
						<template slot="label">
							<span>主从类型</span>
							<Tooltip placement="top" :transfer="true">
								<div slot="content">
									<p>聊天机器人主从类型:主类型，从类型</p>
								</div>
								<Icon type="md-help-circle" />
							</Tooltip>
						</template>
						<Select v-model="form.botType" v-bind:disabled="isDisabled">
							<Option v-for="(item,index) in botType" :key="item.value" :value="item.value">{{item.label}}
							</Option>
						</Select>
					</FormItem>



					<FormItem label="" :label-width="wid"
						v-show="form.useType===1?false:true && form.botType === 'Master'?true:false">
						<Tabs type="card">
							<TabPane label="从节点机器人" v-bind:disabled="isDisabled">
								<div class="rule-list">
									<div class="rule-list-buttom">
										<Button type="primary" @click="addOption()"
											v-bind:disabled="isDisabled">新增从节点机器人</Button>
									</div>
									<div class="rule-list-item" v-for="ruleItem in ruleList">
										机器人：<Select class="item-select" style="width: 130px" v-model="ruleItem.element"
											v-bind:disabled="isDisabled" placeholder="选择机器人" :transfer="true"
											:popper-append-to-body="false">
											<Option v-for="item in elementList" :value="item.botId" :key="item.botId">
												{{ item.name }}
											</Option>
										</Select>
										字段：<Input placeholder="字段" style="width: 80px" class="item-input" maxlength="16"
											v-bind:disabled="isDisabled" v-model="ruleItem.info"
											onkeypress="return /[a-zA-Z0-9_]/.test(event.key)" />
										携带主节点问题：<Select class="item-select" style="width: 80px" v-model="ruleItem.flag"
											v-bind:disabled="isDisabled" placeholder="选择机器人" :transfer="true"
											:popper-append-to-body="false">
											<Option v-for="item in carryingList" :value="item.value" :key="item.value">
												{{ item.label }}
											</Option>
										</Select>
										<Button type="error" v-bind:disabled="isDisabled"
											@click="delRuleOption(ruleItem)">删除</Button>
									</div>
								</div>
							</TabPane>
						</Tabs>
					</FormItem>
					<FormItem label="从节点固定问题" :label-width="wid" v-show="form.botType === 'Slave'?true:false">
						<Input v-model="form.fixedQues" type="textarea" v-bind:disabled="isDisabled"
							placeholder="疼痛是暂时的，勇敢面对会迎来康复的曙光。" clearable />
					</FormItem>
					<FormItem label="长程记忆" :label-width="wid" v-show="form.useType===1?false:true">
						<template slot="label">
							<span>长程记忆</span>
							<Tooltip placement="top" :transfer="true">
								<div slot="content">
									<p>聊天链的历史聊天记录数</p>
								</div>
								<Icon type="md-help-circle" />
							</Tooltip>
						</template>
						<InputNumber v-model="form.memoryLimitSize" :min="0" v-bind:disabled="isDisabled"
							placeholder="长程记忆(条) " number />
					</FormItem>
					<FormItem label="开启溯源免责信息" :label-width="wid" v-show="form.useType===1?false:true">
						<Select v-model="form.traceability" v-bind:disabled="isDisabled">
							<Option v-for="(item,index) in traceability" :key="item.value" :value="item.value">
								{{item.label}}
							</Option>
						</Select>
					</FormItem>
					<FormItem label="分片血缘关系" :label-width="wid" v-show="form.useType===1?false:true">
						<InputNumber v-model="form.fragmentedRelationship" v-bind:disabled="isDisabled"
							placeholder="分片血缘关系" :min="0" :max="10" number />
					</FormItem>
					<FormItem label="分片召回数量" :label-width="wid" v-show="form.useType===1?false:true">
						<template slot="label">
							<span>分片召回数量</span>
							<Tooltip placement="top" :transfer="true" :maxWidth="800">
								<div slot="content">
									<p>召回向量数据的top值</p>
								</div>
								<Icon type="md-help-circle" />
							</Tooltip>
						</template>
						<InputNumber v-model="form.vectorTopK" :min="0" v-bind:disabled="isDisabled" placeholder="召回数量"
							number />
					</FormItem>
					<FormItem label="来源域名" :label-width="wid" v-show="form.useType===1?false:true">
						<Input v-model="form.originDomain" placeholder="来源域名" v-bind:disabled="isDisabled" clearable />
					</FormItem>
				</Form>
				<div slot="footer" style="padding-bottom: 18px;">
					<Button type="primary" size="large" @click="cancelForm('chatBotForm')">取消</Button>
					<Button size="large" @click="submitForm('chatBotForm')" v-if="TreeText!='详情'">确认</Button>
				</div>
			</div>

		</Drawer>

		<Layout>
			<Layout>
				<Tabs value="name1" style="background-color: white; padding-top: 20px">
					<TabPane label="机器人查询" name="name1">
						<div class="search-area">
							<div class="search-item">
								名称：<Input class="item-input" v-model="page.param.name" placeholder="名称"
									style="width:150px" maxlength="50" clearable />
							</div>
							BOTID：<Input class="item-input" v-model="page.param.botId" placeholder="botId"
								style="width:150px" maxlength="100" clearable />
							<div class="search-item">
								使用类型：<Select v-model="page.param.useType" style="width:150px" clearable>
									<Option v-for="item in useType" :value="item.value" :key="item.value">
										{{ item.label }}
									</Option>
								</Select>
							</div>
							<div class="search-item">
								主从类型：<Select v-model="page.param.botType" style="width:150px" clearable>
									<Option v-for="item in botType" :value="item.value" :key="item.value">
										{{ item.label }}
									</Option>
								</Select>
							</div>
							<div class="search-item">
								<Button icon="ios-search" type="primary" class="addNew" @click="search()">搜索</Button>
							</div>
							<div class="search-item">
								<Button icon="md-add-circle" type="primary" class="addNew"
									@click="add2()">新建机器人</Button>
							</div>

						</div>
						<Content>
							<Table stripe border :columns="columns" :data="page.data">
								<template #name="{ row }">
									{{ row.name }}<br>{{ row.journeyId }}
								</template>
								<template slot-scope="{ row, index }" slot="action">
									<Button type="primary" size="small" @click="details(row, index)">详情</Button>
									<Dropdown trigger="click" :transfer="true">
										<a href="javascript:void(0)">
											更多
											<Icon type="ios-arrow-down"></Icon>
										</a>
										<template #list>
											<DropdownItem @click.native="edit(row, index)">编辑</DropdownItem>
											<DropdownItem @click.native="deleteBot(row, index)">删除</DropdownItem>
										</template>
									</Dropdown>
								</template>
							</Table>
						</Content>
						<Footer>
							<Page show-sizer show-total :page-size="page.pageSize" :total="page.total"
								@on-change="changePage" @on-page-size-change="changePageSize" />
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
			const promptCheck = async (rule, value, callback) => {
				let that = this;
				if (that.form.useType == 0) {
					if (that.hasTwoBrackets(this.form.prompt) === false) {
						console.log(that.hasTwoBrackets(this.form.prompt));
						return callback(new Error(this.promptValid));
					}
				}
			}
			return {
				botKnowledgeValue: [],
				botKnowledgeConfig: [],
				carryingList: [{
						value: 0,
						label: '不携带',
					},
					{
						value: 1,
						label: '携带',
					}
				],
				ruleForm: {
					prompt: [{
							validator: promptCheck,
							trigger: 'blur'
						},
						{
							validator: promptCheck,
							trigger: 'change'
						}
					],
					name: [{
							required: true,
							message: '请输入名称',
							trigger: 'blur'
						},
						{
							required: true,
							message: '请输入名称',
							trigger: 'change'
						}
					],
					namespaceId: [{
							required: true,
							type: 'number',
							message: '请选择知识库',
							trigger: 'blur'
						},
						{
							required: true,
							type: 'number',
							message: '请选择知识库',
							trigger: 'change'
						}
					],
					chainsChunkType: [{
							required: true,
							message: '请选择聊天链策略',
							trigger: 'blur'
						},
						{
							required: true,
							message: '请选择聊天链策略',
							trigger: 'change'
						}
					],
				},
				promptValid: '',
				wid: 130,
				isDisabled: true,
				question: {
					privateQuestion: '',
					publicQuestion: ''
				},
				elementList: [],
				ruleCount: 0,
				ruleList: [],
				fragmentedRelationship: [{
						value: 1,
						label: '分片前后追加1',
					},
					{
						value: 2,
						label: '分片前后追加2',
					}
				],
				traceability: [{
						value: 0,
						label: '关闭',
					},
					{
						value: 1,
						label: '开启',
					}
				],
				chainsChunkType: [{
						value: 'stuff',
						label: '全量交换(suff)',
					},
					{
						value: 'refine',
						label: '新旧交互(refine)',
					}
				],
				value: false,
				useType: [{
						value: '1',
						label: '公域',
					},
					{
						value: '0',
						label: '私域',
					},
				],
				botType: [{
						value: 'Master',
						label: '主节点',
					},
					{
						value: 'Slave',
						label: '从节点',
					},
				],
				namespaceData: [{
					"name": "AAAA知识库",
					id: "AAAAA"
				}, {
					"name": "BBBBB知识库",
					id: "BBBB"
				}],
				useTypeData: [{
					"name": "私域(RAG)",
					val: 0
				}, {
					"name": "公域",
					val: 1
				}],
				TreeText: '新增',
				formShowFlag: false,
				form: {
					name: '',
					useType: 1,
					prompt: '',
					namespaceId: '',
					fragmentedRelationship: 0,
					memoryLimitSize: 0,
					vectorTopk: 0
				},
				columns: [{
						type: "index",
						width: 50,
						align: "",
						//fixed: "left",
					},
					{
						title: "名称",
						key: "name",
						minWidth: 300,
						render: (h, params) => {
							return h("span", {}, params.row.name);
						},

					},
					{
						title: "BotId",
						key: "name",
						width: 300,
						render: (h, params) => {
							return h("span", {}, params.row.botId);
						},
						renderHeader: (h, params) => {
							return h('div', [
								h('Tooltip', {
									props: {
										transfer: true,
										maxWidth: '250',
										theme: 'light'
									}
								}, [
									h('span', 'BotId '), // 重写了表头 文字触发气泡
									h('Icon', { // 这里注释是显示 问号图标形式触发
										props: {
											type: 'md-help-circle',
											color: "#c8c8c8",
											size: "20"
										},
										class: {
											iconClass: true
										}
									}),
									h('div', {
											slot: 'content',
											style: {
												whiteSpace: 'normal'
											}
										}, '机器人标识' // 气泡提示整体信息，需要多个复制即可
									),
								])
							])
						}

					},
					{
						title: "使用类型",
						key: "useType",
						width: 100,
						render: (h, params) => {
							return h("span", {}, params.row.useType == 1 ? '公域' : '私域');
						}
					},
					{
						title: "主从类型",
						key: "botType",
						width: 100,
						render: (h, params) => {
							return h("span", {}, params.row.botType == 'Slave' ? '从节点' : '主节点');
						},
						renderHeader: (h, params) => {
							return h('div', [
								h('Tooltip', {
									props: {
										transfer: true,
										maxWidth: '250',
										theme: 'light'
									}
								}, [
									h('span', '主从类型 '), // 重写了表头 文字触发气泡
									h('Icon', { // 这里注释是显示 问号图标形式触发
										props: {
											type: 'md-help-circle',
											color: "#c8c8c8",
											size: "20"
										},
										class: {
											iconClass: true
										}
									}),
									h('div', {
											slot: 'content',
											style: {
												whiteSpace: 'normal'
											}
										}, '聊天机器人主从类型:主类型，从类型' // 气泡提示整体信息，需要多个复制即可
									),
								])
							])
						}

					},
					{
						title: "知识空间",
						key: "namespaceName",
						width: 300,
						render: (h, params) => {
							return h("span", {}, params.row.namespaceName == null ? '--' : params.row
								.namespaceName);
						}
					},
					{
						title: "长程记忆",
						key: "memoryLimitSize",
						width: 100,
						renderHeader: (h, params) => {
							return h('div', [
								h('Tooltip', {
									props: {
										transfer: true,
										maxWidth: '250',
										theme: 'light'
									}
								}, [
									h('span', '长程记忆 '), // 重写了表头 文字触发气泡
									h('Icon', { // 这里注释是显示 问号图标形式触发
										props: {
											type: 'md-help-circle',
											color: "#c8c8c8",
											size: "20"
										},
										class: {
											iconClass: true
										}
									}),
									h('div', {
											slot: 'content',
											style: {
												whiteSpace: 'normal'
											}
										}, '聊天链的历史聊天记录数' // 气泡提示整体信息，需要多个复制即可
									),
								])
							])
						}

					},
					{
						title: "从节点机器人",
						key: "slaveBotMark",
						width: 300,
						render: (h, params) => {
							return h("span", {}, params.row.slaveBotMark == null || params.row.slaveBotMark == '' ?
								'--' : params.row.slaveBotMark);
						}

					},
					{
						title: "召回数量",
						key: "vectorTopK",
						width: 100,
						renderHeader: (h, params) => {
							return h('div', [
								h('Tooltip', {
									props: {
										transfer: true,
										maxWidth: '250',
										theme: 'light'
									}
								}, [
									h('span', '召回数量'), // 重写了表头 文字触发气泡
									h('Icon', { // 这里注释是显示 问号图标形式触发
										props: {
											type: 'md-help-circle',
											color: "#c8c8c8",
											size: "20"
										},
										class: {
											iconClass: true
										}
									}),
									h('div', {
											slot: 'content',
											style: {
												whiteSpace: 'normal'
											}
										}, '召回向量数据的top值' // 气泡提示整体信息，需要多个复制即可
									),
								])
							])
						}
					},
					{
						title: "聊天链策略",
						key: "chainsChunkType",
						width: 120,
						renderHeader: (h, params) => {
							return h('div', [
								h('Tooltip', {
									props: {
										transfer: true,
										maxWidth: '250',
										theme: 'light'
									}
								}, [
									h('span', '聊天链策略'), // 重写了表头 文字触发气泡
									h('Icon', { // 这里注释是显示 问号图标形式触发
										props: {
											type: 'md-help-circle',
											color: "#c8c8c8",
											size: "20"
										},
										class: {
											iconClass: true
										}
									}),
									h('div', {
											slot: 'content',
											style: {
												whiteSpace: 'normal'
											}
										}, '聊天链分块策略,stuff[全量交换],refine[新旧交互]' // 气泡提示整体信息，需要多个复制即可
									),
								])
							])
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
						width: 120,
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
					param: {
						name: ""
					}
				}
			};

		},
		mounted() {
			this.allNamespace();
			this.allSlave();
			this.list(1);
			this.getQuestionParam();
			this.getBotKnowledgeConfig();
		},
		methods: {
			getBotKnowledgeConfig(){
				let that =this;
				let param = {};
				that.axios.getBotKnowledgeConfig(param).then(data => {
					that.botKnowledgeConfig = data.data.data;
					console.log("botKnowledgeConfig:",that.botKnowledgeConfig);
				}).catch(error=>{
					console.log("error:",error);
				})
			},
			getQuestionParam() {
				let that = this;
				let param = {};
				this.axios.getQuestionParam(param).then(data => {
					//console.log(data.data.data.privateQuestion);
					that.question = data.data.data;
					console.log(that.question);
				}).catch(error => {
					console.log("error: ", error);
					//this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
				})
			},
			allSlave() {
				let param = {};
				let _this = this;
				this.axios.allSlave(param).then(data => {
					if (data.data.code == '0') {
						_this.elementList = data.data.data;
					} else {
						//this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
					}
				}).catch(error => {
					console.log("error: ", error)
					//this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
				})
			},
			delRuleOption(item) {
				let _this = this;
				for (let _index = 0; _index < _this.ruleList.length; _index++) {
					console.log("_this.ruleList.length:" + _this.ruleList.length);
					if (_this.ruleList[_index].index === item.index) {
						console.log("item.index" + _this.ruleList.length);
						_this.ruleList.splice(_index, 1);
						this.$forceUpdate();
						break;
					}
				}
			},
			addOption() {
				this.ruleList.push({
					index: this.ruleCount++,
					element: "",
					info: "",
				});
				this.$forceUpdate();
			},
			handleSelectChange(value) {
				let that = this;
				// 处理值改变时的逻辑
				if (value == '1') {
					if (that.question.publicQuestion === '') {
						this.form.prompt =
							"我想让你做一个{context}。我会把我的位置写给你，你会推荐一个靠近我的位置的地方。在某些情况下，我还会告诉您我将访问的地方类型。您还会向我推荐靠近我的第一个位置的类似类型的地方。我的第一个建议请求是{question}";
					} else {
						var textFromBackend = that.question.publicQuestion;
						textFromBackend = textFromBackend.replace(/\\n/g, "\n");
						that.question.publicQuestion = textFromBackend;
						that.form.prompt = that.question.publicQuestion;
					}
					that.form.useType = 1;
				} else {
					that.form.useType = 0;
					if (that.question.publicQuestion === '') {
						that.form.prompt = '使用以下上下文来回答最后的问题。如果你不知道答案，就说你不知道，不要试图编造答案。\n' +
							'\n' +
							'{context}\n' +
							'\n' +
							'{chat_history}\n' +
							'\n' +
							'问题: {question}\n' +
							'请按照以下格式回答问题，如:\n' +
							'answer:\n' +
							'1.\n' +
							'2.\n' +
							'3.\n' +
							'回答:';
					} else {
						var textFromBackend = that.question.privateQuestion;
						textFromBackend = textFromBackend.replace(/\\n/g, "\n");
						that.question.privateQuestion = textFromBackend;
						that.form.prompt = that.question.privateQuestion;
					}
				}
				that.$forceUpdate();
			},
			fromVisibelChange() {
				console.log("fromVisibelChange")
			},
			validataForm() {
				var _result = true;
				let that = this;
				if (this.form.name.length == 0) {
					this.showViewMessage('请输入名称');
					_result = false;
					return;
				}
				if (this.form.useType == 0) {
					if (!this.hasTwoBrackets(this.form.prompt)) {
						this.showViewMessage(that.promptValid);
						_result = false;
						return;
					}
					if (this.form.namespaceId == null) {
						this.showViewMessage('请选择知识库');
						_result = false;
						return;
					}
					if (this.form.chainsChunkType == null) {
						this.showViewMessage('请选择聊天链策略');
						_result = false;
						return;
					}
				}


				return _result;
			},
			hasTwoBrackets(str) {
				let flag = 0;
				let count = 0;
				let that = this;
				for (let i = 0; i < str.length; i++) {
					if (str[i] === '{') {
						flag++;
						count++;
					}

					if (str[i] === '}') {
						flag--;

					}
				}
				if (!(flag === 0)) {
					that.promptValid = '提示词{}缺失';
					return false;
				}

				if (count === 0) {
					that.promptValid = '提示词请输入context与question';
					return false;
				}
				if (count === 1) {
					if (that.form.prompt.includes('问题:') || that.form.prompt.includes('问题：')) {
						that.promptValid = '提示词请输入context';
					} else {
						that.promptValid = '提示词请输入question';
					}
					return false;
				}
				return true;
			},
			submitForm(name) { //新增確認
				this.$refs.chatBotForm.validate(async (valid) => {
					if (valid) {
						//this.$Message.success('校验通过');
						//执行后续操作
					} else {
						//this.$Message.error('请检查输入项！');
					}
				})
				if (this.validataForm()) {

					this.isDisabled = false;
					this.form.llms = this.botKnowledgeValue[0];
					this.form.llmsBase = this.botKnowledgeValue[1];
					let param = this.form;
					let that = this;
					let slaveBotMark = '';
					let slaveCarryingQuestion = [];
					for (let _index = 0; _index < that.ruleList.length; _index++) {
						if (_index === that.ruleList.length - 1) {
							slaveBotMark = slaveBotMark + that.ruleList[_index].element + ':' + that.ruleList[_index].info;
							slaveCarryingQuestion.push({botId:that.ruleList[_index].element,flag:that.ruleList[_index].flag});
							break;
						}
						slaveCarryingQuestion.push({botId:that.ruleList[_index].element,flag:that.ruleList[_index].flag});
						slaveBotMark = slaveBotMark + that.ruleList[_index].element + ':' + that.ruleList[_index].info +
							',';
					}
					param.slaveBotMark = slaveBotMark;
					param.slaveCarryingQuestion = JSON.stringify(slaveCarryingQuestion);
					if (this.TreeText == '新增') {
						this.axios.save(param).then(function(data) {
							console.log("返回", data)
							if (data.data.code == '0') {
								that.value = false;
								that.$Modal.success({
									'title': '提示',
									'content': '新增成功'
								});
								// window.location.reload()
								that.list();
							} else {
								that.$Modal.error({
									'title': '提示',
									'content': '操作失败'
								});
							}
						}).catch(function(error) {
							console.log("error: ", error);
							that.$Modal.error({
								'title': '提示',
								'content': '操作失败'
							});
						});
					} else {
						this.axios.update(param).then(function(data) {
							if (data.data.code == '0') {
								// window.location.reload();
								console.log(that.form.vectorTopk);
								that.value = false;
								that.$Modal.success({
									'title': '提示',
									'content': '修改成功'
								});
								that.list();
							}
						}).catch(function(error) {
							console.log("error: ", error);
							that.$Modal.error({
								'title': '提示',
								'content': '操作失败'
							});
						});
					}

				}
			},
			cancelForm(name) { //取消
				this.formShowFlag = false;
				this.value = false;
			},
			add2() {
				this.$refs.chatBotForm.resetFields();
				this.value = true;
				this.isDisabled = false;
				this.$refs['chatBotForm'].resetFields();
				this.TreeText = '新增';
				this.botKnowledgeValue = [];
				this.form = {};
				this.form.name = '';
				this.form.useType = 0;
				this.form.fragmentedRelationship = 0;
				this.form.memoryLimitSize = 0;
				this.form.vectorTopk = 0;
				this.form.traceability = 0;

				this.form.botType = 'Master';
				this.ruleList = [];
				let that = this;
				if (that.question.privateQuestion === '') {
					that.form.prompt = '使用以下上下文来回答最后的问题。如果你不知道答案，就说你不知道，不要试图编造答案。\n' +
						'\n' +
						'{context}\n' +
						'\n' +
						'{chat_history}\n' +
						'\n' +
						'问题: {question}\n' +
						'请按照以下格式回答问题，如:\n' +
						'answer:\n' +
						'1.\n' +
						'2.\n' +
						'3.\n' +
						'回答:';
				} else {
					let textFromBackend = that.question.privateQuestion;
					textFromBackend = textFromBackend.replace(/\\n/g, "\n");
					that.question.privateQuestion = textFromBackend;
					that.form.prompt = that.question.privateQuestion;
				}
				this.formShowFlag = false;
			},
			addPrompt() {
				this.$refs['chatBotForm'].resetFields();
				this.TreeText = '新增';
				this.form = {};
				this.form.prompt = '';
				this.form.useType = 1;
				this.form.name = '';

				this.formShowFlag = true;
			},
			details(row, index) {
				this.TreeText = '详情';
				this.isDisabled = true;
				this.form = row;
				this.form.namespaceId = parseInt(row.namespaceId);
				this.ruleList = [];
				this.botKnowledgeValue = [];
				if(row.llms != null || row.llmsBase != null){
					this.botKnowledgeValue[0] = row.llms;
					this.botKnowledgeValue[1] = row.llmsBase;
				}
				console.log(this.botKnowledgeValue);
				let that = this;
				if (row.slaveBotMark) {
					let param = '';
					param = row.botId;
					this.axios.listSlave(param).then(data => {
						console.log("data: {}" , data.data.data);
						let list = [];
						list = data.data.data;
						for (let _index = 0; _index < list.length; _index++) {
							that.ruleList.push({
								index: this.ruleCount++,
								element: list[_index].botId,
								info: list[_index].info,
								flag:list[_index].flag,
							})

						}


					}).catch(error => {
						console.log("error: ", error)
						this.$Modal.error({
							'title': '获取失败',
							'content': '获取失败'
						});
					});
				}
				this.form = JSON.parse(JSON.stringify(row));
				//this.formShowFlag=true;
				this.value = true;
				that.$forceUpdate();
			},
			edit(row, index) {
				this.$refs.chatBotForm.resetFields();
				this.TreeText = '编辑';
				this.isDisabled = false;
				this.botKnowledgeValue = [];
				if(row.llms != null || row.llmsBase != null){
					this.botKnowledgeValue[0] = row.llms;
					this.botKnowledgeValue[1] = row.llmsBase;
				}
				this.form = row;
				this.form.namespaceId = parseInt(row.namespaceId);
				let that = this;
				this.ruleList = [];
				if (row.slaveBotMark) {
					let param = '';
					param = row.botId;
					this.axios.listSlave(param).then(data => {
						console.log("data:" + data.data.data[0].name);
						let list = [];
						list = data.data.data;
						for (let _index = 0; _index < list.length; _index++) {
							console.log('flag :',list[_index].flag);
							that.ruleList.push({
								index: this.ruleCount++,
								element: list[_index].botId,
								info: list[_index].info,
								flag: list[_index].flag
							})
							

						}


					}).catch(error => {
						console.log("error: ", error)
						this.$Modal.error({
							'title': '获取失败',
							'content': '获取失败'
						});
					});
				}
				this.value = true;
				this.form = JSON.parse(JSON.stringify(row));
				console.log(this.form);
				that.$forceUpdate();
			},
			deleteBot(row, index) {
				console.log(row)
				let _this = this;
				var truthBeTold = window.confirm("确定要删除吗？")
				if (truthBeTold) {
					let param = {
						id: row.id
					}
					this.axios.delete(param).then(data => {
						if (data.data.code == '0') {
							// window.location.reload();
							_this.list(_this.page.pageNum);
							_this.$Modal.success({
								'title': '提示',
								'content': '操作成功',
							});
						} else {
							this.$Modal.error({
								'title': '提示',
								'content': data.data.code + ":" + data.data.message
							});
						}
					})
				}
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
				this.axios.listBot(param).then(data => {
					if (data.data.code == '0') {
						this.page.data = data.data.data.data;
						this.page.total = data.data.data.total;

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
				});
			},
			allNamespace() {
				let param = {};
				let _this = this;
				this.axios.allNamespace(param).then(data => {
					if (data.data.code == '0') {
						_this.namespaceData = data.data.data;
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

	.chatBot-list {
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