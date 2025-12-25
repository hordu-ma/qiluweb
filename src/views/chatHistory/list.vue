<template>
	<div class="main-page customer-order">
		<Layout>
			<Layout>
				<Tabs value="name1" style="background-color: white;padding-top: 20px">
					<TabPane label="聊天记录详情" name="name1">
						<div class="search-area" style="display: flex;justify-content: space-between;">
							<div class="search-item" style="display: flex;align-items: center;">
								日期&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{page.queryValue}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</div>
							<div class="search-item" style="float: right;margin-right: 10px;">
								<Button size="large" icon="ios-download-outline" type="primary" class="addNew"
									@click="download()">Download</Button>
							</div>
						</div>

						<Content>
							<Table stripe border :columns="columns" :data="page.data">
								<template slot-scope="{ row, index }" slot="action">
									<Button type="primary" size="small" @click="details(row, index)">详情</Button>
									<Button type="primary" size="small" @click="edit(row, index)">编辑</Button>
									<Button type="primary" size="small" @click="deleteBot(row, index)">删除</Button>
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
			return {
				namespaceData: [{
					"name": "AAAA知识库",
					id: "AAAAA"
				}, {
					"name": "BBBBB知识库",
					id: "BBBB"
				}],
				useTypeData: [{
					"name": "公域(Prompt)",
					val: 1
				}, {
					"name": "私域(本地知识)",
					val: 0
				}],
				TreeText: '新增',
				formShowFlag: false,
				form: {
					name: '',
					useType: 1
				},
				columns: [{
						type: "index",
						width: 50,
						align: "",
					},
					{
						title: "问题",
						key: "question",
						tooltip: true,
						render: (h, params) => {
							return h("span", {}, params.row.question);
						},
					},
					{
						title: "回答形式",
						key: "answerType",
						render: (h, params) => {
							return h("span", {}, params.row.answerType);
						},
					},
					{
						title: "沟通人群",
						key: "groupUuid",
						render: (h, params) => {
							return h("span", {}, params.row.groupUuid);
						}
					},
					{
						title: "使用标签",
						key: "useMark",
						render: (h, params) => {
							return h("span", {}, params.row.useMark);
						}
					},
					{
						title: "AI回答内容",
						key: "answer",
						// render: (h, params) => {
						//   return h("span", {}, params.row.answer);
						// }
						render: (h, params) => {
							return h('div', [
								h('Tooltip', {
									props: {
										content: params.row.answer,
										maxWidth: 800,
										transfer: true
									}
								}, "详细内容")
							])
						}
					},
					{
						title: "提示词",
						key: "prompt",
						render: (h, params) => {
							return h("div", [
								h('Tooltip', {
									props: {
										content: params.row.prompt,
										maxWidth: 2000,
										transfer: true
									}
								}, "详细内容")
							]);
						}
					},
					{
						title: "赞/踩",
						key: "answerLike",
						render: (h, params) => {
							return h("span", {}, params.row.answerLike);
						}
					},
					{
						title: "评论内容",
						key: "comment",
						render: (h, params) => {
							return h("span", {}, params.row.comment);
						}
					},

					// {
					//     title: "操作",
					//     key: "operate",
					//     width: 420,
					//     align: "center",
					//     slot: "action",
					//     fixed: "right",
					// },
				],
				page: {
					data: [],
					total: 0,
					pageSize: 10,
					pageNum: 1,
					queryValue: '',
					param: {}
				}
			};
		},
		mounted() {
			// let code = this.$route.query.code;
			// if(code){
			// 	console.log('code' + code);
			// }
			// localStorage.setItem('code',code);
			let groupDate = this.$route.query.groupDate;
			if (groupDate != null && groupDate !== '') {
				this.page.queryValue = groupDate;
			}
			this.list(1);
		},
		methods: {
			download() {
				this.axios.download(this.page.queryValue).then(data => {
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
				this.axios.list(param).then(data => {
					if (data.data.code == '0') {
						this.page.data = data.data.data.data;
						this.page.total = data.data.data.total;
						console.log(this.page.data);
						for (let _index = 0; _index < this.page.data.length; _index++) {
							if (this.page.data[_index].answerType === 'None') {
								this.page.data[_index].answerType = '--';
							}
							if (this.page.data[_index].groupUuid === 'None' || this.page.data[_index].groupUuid ===
								'null' || this.page.data[_index].groupUuid === '') {
								this.page.data[_index].groupUuid = '--';
							}
							if (this.page.data[_index].useMark === 'None') {
								this.page.data[_index].useMark = '--';
							}
							if (this.page.data[_index].answerLike === null) {
								this.page.data[_index].answerLike = '--';
							}
							if (this.page.data[_index].comment === 'None') {
								this.page.data[_index].comment = '--';
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

	.action-container {
		display: flex;

		.action-card {
			display: flex;
			padding-top: 25px;
			padding-block: 25px;

			.action-card-item {
				height: 70px;
				width: 190px;
				border: 1px solid;
				border-radius: 6px;
				background-color: #fff;
				margin-right: 12px;
				padding: 5px 16px;

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