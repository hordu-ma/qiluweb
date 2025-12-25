<template>
    <div class="main-page namespace-list">
        <Tabs value="name1" style="padding-top: 20px;">
            <TabPane label="图表文件列表" name="name1">
                <div class="search-area">
                    <div class="search-item">
                        名称：<Input class="item-input" v-model="page.name" style="width:200px" placeholder="文件名称"
                            maxlength="50" clearable />
                    </div>
                    <div class="search-item">
                        <Button icon="ios-search" type="primary" class="addNew" @click="search()">搜索</Button>
                    </div>
                    <div class="search-item">
                        <Button icon="md-add-circle" type="primary" class="addNew" @click="upload()">上传</Button>
                    </div>
                </div>
                <Content>
                    <Table stripe border :columns="columns" :data="page.data">
                        <template #name="{ row }">
                            {{ row.name }}<br>{{ row.journeyId }}
                        </template>
                        <template slot-scope="{ row, index }" slot="action">
                            <Button type="primary" size="small">详情</Button>
                            <Button type="primary" size="small">删除</Button>
                        </template>
                    </Table>
                </Content>
                <Footer>
                    <Page show-sizer show-total :page-size="page.pageSize" :total="page.total" @on-change="changePage"
                        @on-page-size-change="changePageSize" />
                </Footer>

                <!-- 图表文件上传弹框 -->
                <modal title="上传" v-model="bus.showFlag" :mask-closable="false" @on-visible-change="fromVisibelChange"
                    @on-ok="submitForm" @on-cancel="cancelForm">
                    <div>
                        <Form ref="excelFrom" :model="form" :label-width="110">
                            <FormItem label="图表文件" required>
                                <Upload :before-upload="handleUpload" ref="upload" :show-upload-list="true" type="drag"
                                    accept=".xlsx,.xls" :data="form" :on-success="successUpload" :on-error="errorUpload"
                                    action="/api/namespace/excel-relation/upload">
                                    <div style="padding: 20px 0">
                                        <Icon type="ios-cloud-upload" size="52"></Icon>
                                        <p>Click or drag files here to upload</p>
                                    </div>
                                </Upload>
                            </FormItem>
                            <FormItem label="所属文件">
                                <Input v-model="page.fileName" disabled clearable />
                            </FormItem>
                            <FormItem label="备注信息">
                                <Input v-model="form.remark" type="textarea" placeholder="请输入备注信息"
                                    v-bind:disabled="bus.disabled" clearable />
                            </FormItem>
                        </Form>
                    </div>
                    <div slot="footer">
                        <Button type="primary" size="large" @click="cancelForm()">取消</Button>
                        <Button type="default" size="large" @click="submitForm()">确认</Button>
                    </div>
                </modal>
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
            form: { 
                fileId: '',
                remark: '',
            },
            namespaceId: "",
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
                    key: "excelId",
                    width: 200,
                },
                {
                    title: "图表数量",
                    key: "type",
                    width: 120,
                    render: (h, params) => {
                        let text = '0';
                        if (params.row.imageList) { text = params.row.imageList.length; }
                        return h("span", {}, text);
                    },
                },
                {
                    title: "查看更多",
                    key: "imageList",
                    type: 'expand',
                    width: 100,
                    render: (h, params) => {
                        let text = ''
                        if (params.row.imageList) {
                            for (var i = 0; i < params.row.imageList.length; i++) {
                                text = text + '【' + params.row.imageList[i].markNum + '】';
                            }
                        }
                        return h("div", {}, text);
                    },
                },
                {
                    title: "类型",
                    key: "type",
                    width: 300,
                    render: (h, params) => {
                        let text = '--';
                        if (params.row.type) { text = params.row.type; }
                        return h("span", {}, text);
                    },
                },
                {
                    title: "备注信息",
                    key: "remark",
                    minWidth: 300,
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
                    width: 120,
                    align: "center",
                    slot: "action",
                    fixed: "right",
                },
            ],
            page: {
                name: "",
                data: [],
                total: 0,
                pageSize: 10,
                pageNum: 1,
                name: "",
                fileName: "",
                fileId: "",
            }
        };
    },
    mounted() {
        const urlParam = this.getUrlParam();
        this.namespaceId = urlParam.id;
        this.page.fileId = urlParam.fileId;
        this.page.fileName = decodeURIComponent(urlParam.displayName);
        console.log(this.page);
        this.list(1);
    },
    methods: {
        upload() {
            this.$refs['excelFrom'].resetFields();
            this.form = {};
            this.bus.showFlag = true;
            this.bus.disabled = false;
        },
        handleUpload(file) {
            this.file = file;
            return true;
        },
        successUpload(data) {
            this.$refs['excelFrom'].resetFields();
            this.bus.showFlag = false;
            this.list(1);
            this.$Modal.success({ 'title': '提示', 'content': '上传成功', });
        },
        errorUpload(data) {
            // this.$Modal.error({ 'title': '提示', 'content': '上传失败' + data });
        },
        fromVisibelChange() {
            console.log("fromVisibelChange")
        },
        submitForm() {
            this.form.fileId = this.page.fileId;
            if (this.file) {
                // 手动触发上传
                this.$refs.upload.post(this.file);
                this.bus.showFlag = false;
            } else {
                this.$Modal.error({ 'title': '提示', 'content': '请选择需要上传的图表文件'});
            }
        },
        cancelForm() {
            this.bus.showFlag = false;
        },
        details(row, index) {
            this.form = JSON.parse(JSON.stringify(row));
            this.bus.showFlag = true;
            this.bus.disabled = true;
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
            this.axios.relationExcelPage(param).then(data => {
                console.log(data.data.data);
                if (data.data.code == '0') {
                    this.page.data = data.data.data.data;
                    this.page.total = data.data.data.total;
                } else {
                    this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
                }
            }).catch(error => {
                console.log("error: ", error)
                this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
            });
        },
        getUrlParam() {
            let geturl = window.location.href
            let getqyinfo = geturl.split('?')[1]
            let getqys = getqyinfo.split('&')
            let obj = {}  //创建空对象，接收截取的参数
            for (let i = 0; i < getqys.length; i++) {
                let item = getqys[i].split('=')
                let key = item[0]
                let value = item[1]
                obj[key] = value
            }
            return obj;
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
}
</style>
  