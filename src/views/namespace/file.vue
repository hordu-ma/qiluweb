<template>
  <div class="main-page namespace-file-list">
    <Tabs value="name1" style="padding-top: 20px;">
      <!-- 文件列表 -->
      <TabPane label="文件列表" name="name1">
        <div class="search-area">
          <div class="search-item">
            名称：<Input class="item-input" v-model="page.file.param.displayName" placeholder="文件名称" maxlength="100"
              clearable />
          </div>
          <Button icon="ios-search" type="primary" class="addNew" @click="searchFile()">搜索</Button>
          <Button icon="md-add-circle" type="primary" class="addNew" @click="addFile()">新建</Button>
        </div>
        <Content>
          <Table stripe border :columns="page.file.columns" :data="page.file.data">
            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" @click="detailsFile(row, index)">详情</Button>
              <Button type="primary" size="small" @click="editFile(row, index)">编辑</Button>
<!--              <Button type="primary" size="small" @click="showExcelPageWithRelation(row, index)">关联文件</Button>-->
              <Dropdown trigger="click" :transfer="true">
                <a href="javascript:void(0)">
                  更多
                  <Icon type="ios-arrow-down"></Icon>
                </a>
                <template #list>
                  <DropdownMenu>
                    <DropdownItem @click.native="previewFile(row, index)">预览</DropdownItem>
                    <DropdownItem @click.native="downloadFile(row, index)">下载</DropdownItem>
                    <Poptip :transfer="true" confirm word-wrap width="250" placement="right-start" 
                      title="该操作产生费用，请确认是否生成分片？" @on-ok="generateChunk(row, index)"
                      v-show="row.vectorStatus == 'None' || row.vectorStatus == 'Wait' || row.vectorStatus == 'Fail' || row.vectorStatus == 'Vectoring'">
                      <Button :disabled = "generateChunkFlag">生成分片</Button>
                    </Poptip>
                    <br v-show="row.vectorStatus == 'None' || row.vectorStatus == 'Wait' || row.vectorStatus == 'Fail'" />
                    <Poptip :transfer="true" confirm word-wrap width="250" placement="right" title="该操作不可撤销，请确认是否清空分片？"
                      @on-ok="removeChunk(row, index)" v-show="row.vectorStatus == 'Done'">
                      <Button>清空分片</Button>
                    </Poptip>
                    <br v-show="row.vectorStatus == 'Done'" />
                    <Poptip :transfer="true" confirm word-wrap width="250" placement="right-end"
                      title="该操作不可撤销，请确认是否删除文件？" @on-ok="deleteFile(row, index)">
                      <Button>删除</Button>
                    </Poptip>
                  </DropdownMenu>
                </template>
              </Dropdown>
            </template>
          </Table>
        </Content>
        <Footer>
          <Page transfer show-sizer show-total :page-size="page.file.pageSize" :total="page.file.total"
            @on-change="changeFilePage" @on-page-size-change="changeFilePageSize" />
        </Footer>
      </TabPane>

      <!-- 分片列表 -->
      <TabPane label="分片列表" name="name2">
        <div class="search-area">
          <div class="search-item">
            文件：
            <Select ref="fileIdSelect" v-model="page.chunk.fileId" clearable style="width:200px" transfer>
              <Option v-for="item in page.file.data" :value="item.id" :key="item.id">{{ item.displayName }}</Option>
            </Select>
          </div>
          <div class="search-item">
            内容：<Input class="item-input" v-model="page.chunk.content" placeholder="分片内容" maxlength="100" clearable />
          </div>
          <div class="search-item">
            分片标识：<Input class="item-input" v-model="page.chunk.chunkId" placeholder="分片标识" maxlength="100" clearable />
          </div>
          <Button icon="ios-search" type="primary" class="addNew" @click="searchChunk()">搜索</Button>
          <Button icon="md-add-circle" type="primary" class="addNew" @click="createChunk()">添加分片</Button>
        </div>
        <Content>
          <Table stripe border :columns="page.chunk.columns" :data="page.chunk.data">
            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" @click.native="detailChunk(row, index)">详情</Button>
              <Dropdown trigger="click" :transfer="true">
                <a href="javascript:void(0)">
                  更多
                  <Icon type="ios-arrow-down"></Icon>
                </a>
                <template #list>
                  <DropdownMenu>
                    <DropdownItem @click.native="updateChunk(row, index)">编辑</DropdownItem>
                    <Poptip :transfer="true" confirm word-wrap width="250" placement="right-end"
                      title="该操作不可撤销，请确认是否删除分片？" @on-ok="deleteChunk(row, index)">
                      <Button>删除</Button>
                    </Poptip>
                  </DropdownMenu>
                </template>
              </Dropdown>
            </template>
          </Table>
        </Content>
        <Footer>
          <Page transfer show-sizer show-total :page-size="page.chunk.pageSize" :total="page.chunk.total"
            @on-change="changeChunkPage" @on-page-size-change="changeChunkPageSize" />
        </Footer>
      </TabPane>
    </Tabs>

    <!-- 知识文件弹框 -->
    <modal :title="TreeText" v-model="bus.showFlag" :mask-closable="false" @on-visible-change="fromVisibelChange"
      @on-ok="submitForm" @on-cancel="cancelForm">
      <div>
        <Form ref="namespaceFileFrom" :model="form" :label-width="110">
          <FormItem label="知识文件" required>
            <Upload :before-upload="handleUpload" ref="upload" :show-upload-list="true" type="drag"
              v-bind:disabled="bus.disabled || bus.uploadDisabled" accept=".pdf,.zip,.docx" :data="form"
              :on-success="successUpload" :on-error="errorUpload" action="/api/namespace/file/upload">
              <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52"></Icon>
                <p>Click or drag files here to upload</p>
              </div>
            </Upload>
          </FormItem>
          <FormItem label="向量化方式" required>
            <Select class="item-input" v-model="form.vectorType" v-bind:disabled="bus.disabled" clearable>
              <Option v-for="item in vectorTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="溯源名称" required>
            <Input v-model="form.traceName" placeholder="请输入溯源名称" v-bind:disabled="bus.disabled" clearable />
          </FormItem>
          <FormItem label="备注信息">
            <Input v-model="form.remark" type="textarea" placeholder="请输入备注信息" v-bind:disabled="bus.disabled" clearable />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="cancelForm('namespaceFileFrom')">取消</Button>
        <Button type="default" size="large" @click="submitForm('namespaceFileFrom')" v-if="TreeText != '详情'">确认</Button>
      </div>
    </modal>

    <!-- 分片抽屉页面 -->
    <Drawer :title="chunk.drawerTitle" :closable="false" v-model="bus.chunk.showFlag" width="50">
      <div>
        <Form ref="chunkForm" :model="chunk.form" :label-width="110">
          <div style="font-size: large; padding-bottom: 20px;">基本信息</div>
          <FormItem label="分片标识" required>
            <Input placeholder="请输入分片标识" v-model="chunk.form.customId" disabled clearable />
          </FormItem>
          <FormItem label="所属文件" required>
            <Select v-model="chunk.form.fileId" v-bind:disabled="bus.chunk.editFlag || bus.chunk.readFlag" @on-change="reloadExcelImages()">
              <Option v-for="item in page.file.data" :key="String(item.id)" :value="String(item.id)">{{ item.displayName
              }}</Option>
            </Select>
          </FormItem>
          <FormItem label="分片内容" required>
            <Input placeholder="请输入分片内容" v-model="chunk.form.document" v-bind:disabled="bus.chunk.readFlag" :rows="15" type="textarea" clearable />
          </FormItem>
          <div style="font-size: large; padding: 0px 0px 20px 0px;">隐藏属性</div>
          <FormItem label="源文件名称" required>
            <Input placeholder="请输入源文件名称" v-model="chunk.form.metadata.name" v-bind:disabled="bus.chunk.readFlag" clearable />
          </FormItem>
          <FormItem label="源文件来源" required>
            <Input placeholder="请输入源文件来源" v-model="chunk.form.metadata.source" v-bind:disabled="bus.chunk.readFlag" clearable />
          </FormItem>
          <FormItem label="场景值">
            <Input placeholder="请输入场景值" v-model="chunk.form.metadata.scene" v-bind:disabled="bus.chunk.readFlag" clearable />
          </FormItem>
          <FormItem label="标准回答">
            <Input placeholder="请输入标准回答" v-model="chunk.form.metadata.answer" v-bind:disabled="bus.chunk.readFlag" clearable />
          </FormItem>
<!--          <FormItem label="">
            <Tabs type="card">
              <TabPane label="关联图表信息">
                <div class="relation-list">
                  <div class="relation-list-buttom">
                    <Button type="primary" @click="addRelationOption()" v-bind:disabled="bus.chunk.readFlag">新增关联</Button>
                  </div>
                  <div class="relation-list-item" v-for="relationItem in chunk.form.metadata.images" v-bind:disabled="bus.chunk.readFlag">
                    <Cascader :transfer="true" :data="chunk.abcList" :filterable="true" v-model="relationItem.defList"
                      :change-on-select="true" :width="200" @on-change="selectRelationExcel(relationItem)" v-bind:disabled="bus.chunk.readFlag"/>
                    <Button type="error" @click="delRelationOption(relationItem)" v-bind:disabled="bus.chunk.readFlag">删除</Button>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </FormItem>-->
        </Form>
        <div slot="footer">
          <Button type="primary" size="large" @click="cancelForm('chunkForm')">取消</Button>
          <Button type="default" size="large" @click="submitForm('chunkForm')" v-if="!bus.chunk.readFlag">确认</Button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script>
export default {
  data() {
    return {
	  generateChunkFlag: false,
      bus: {
        showFlag: false, // 是否显示抽屉
        disabled: false, // 是否关闭抽屉编辑
        uploadDisabled: false, // 是否关闭上传能力
        chunk: {
          showFlag: false, // 是否显示抽屉
          disabled: false, // 是否关闭抽屉编辑
          editFlag: false, // 编辑场景标记
          readFlag: false, // 只读场景标记
        }
      },
      chunk: {
        form: {
          customId: "",
          fileId: "",
          metadata: {
            name: "",
            source: "",
            scene: "",
            answer: "",
          },
          images: [
            {
              excel_id: "",
              image_id: "",
            }
          ],
        },
        drawerTitle: "",
        excelList: [],
        abcList: [],
        relationCount: 0,
      },
      vectorTypeList: [
        {
          id: "Task",
          name: "调度任务",
        },
        {
          id: "Person",
          name: "人工执行",
        },
      ],
      TreeText: '新增',
      form: { namespaceId: '', name: '' },
      namespaceId: '',
      page: {
        file: {
          data: [],
          total: 0,
          pageSize: 10,
          pageNum: 1,
          param: {
            displayName: "",
            namespaceId: "",
          },
          columns: [
            {
              type: "index",
              width: 50,
              align: "",
            },
            {
              title: "显示名称",
              key: "displayName",
              width: 450
            },
            {
              title: "状态",
              key: "vectorStatus",
              width: 180,
              render: (h, params) => {
                let text = '--'
                if (params.row.vectorStatus == 'Done') { text = '向量化成功'; }
                else if (params.row.vectorStatus == 'Fail') { text = '向量化失败'; }
                else if (params.row.vectorStatus == 'None') { text = '未向量化'; }
                else if (params.row.vectorStatus == 'Wait') { text = '未向量化（待人工执行）'; }
				else if (params.row.vectorStatus == 'Vectoring') { text = '向量化中'; }
                return h("span", {}, text);
              },
            },
            {
              title: "向量化方式",
              key: "vectorType",
              width: 180,
              render: (h, params) => {
                let text = '--'
                if (params.row.vectorType == 'Person') { text = '人工执行'; }
                else if (params.row.vectorType == 'Task') { text = '调度任务'; }
                return h("span", {}, text);
              },
            },
            {
              title: "重试次数",
              key: "vectorCount",
              width: 100,
            },
            {
              title: "文件大小",
              key: "size",
              width: 100,
            },
            {
              title: "文件路径",
              key: "path",
              width: 300,
            },
            {
              title: "文件类型",
              key: "type",
              width: 300,
            },
            {
              title: "溯源名称",
              key: "traceName",
              width: 450,
              render: (h, params) => {
                let text = params.row.traceName;
                if (params.row.traceName == null || params.row.traceName == '') { text = '--'; }
                return h("span", {}, text);
              },
            },
            {
              title: "说明",
              key: "remark",
              minWidth: 500,
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
              width: 250,
              align: "center",
              slot: "action",
              fixed: "right",
            },
          ],
        },
        chunk: {
          data: [],
          total: 0,
          pageSize: 10,
          pageNum: 1,
          namespaceId: "",
          fileId: "",
          chunkId: "",
          content: "",
          columns: [
            {
              type: "index",
              width: 50,
              align: "",
            },
            {
              title: "分片标识",
              key: "customId",
              width: 280,
            },
            {
              title: "所属文件名称",
              key: "metadata.name",
              width: 180,
              render: (h, params) => {
                let text = '--'
                if (params.row.metadata.name) { text = params.row.metadata.name; }
                return h("span", {}, text);
              },
            },
            {
              title: "关联图表数",
              key: "metadata.images",
              width: 100,
              render: (h, params) => {
                let text = '0'
                if (params.row.metadata.images) { text = params.row.metadata.images.length; }
                return h("span", {}, text);
              },
            },
            {
              title: "分片内容",
              key: "document",
              minWidth: 300,
              render: (h, params) => {
                return h('Tooltip', {
                  props: {
                    content: params.row.document,//tooltip提示框内容
                    transfer: true,//防止最后一行被挡住
                    maxWidth: 500,//最大宽度（tooltip的宽度）
                  }
                }, [
                  h('span', {
                    style: {
                      display: 'inline-block',
                      width: '280px',//设置table表格显示内容的宽度，（不设置会全部显示，没有省略号）
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',//设置省略号
                      whiteSpace: 'nowrap'//设置不换行（如果不设置默认换行，那么不会显示省略号）
                    },
                  }, params.row.document)
                ])
              },
            },
            {
              title: "查看更多",
              key: "document",
              type: 'expand',
              width: 100,
              render: (h, params) => {
                let text = '--'
                if (params.row.document) { text = params.row.document; }
                return h("span", {}, text);
              },
            },
            {
              title: "所属文件标识",
              key: "fileId",
              width: 120,
              render: (h, params) => {
                let text = '--'
                if (params.row.fileId) { text = params.row.fileId; }
                return h("span", {}, text);
              },
            },
            {
              title: "创建时间",
              key: "createTime",
              width: 180,
              render: (h, params) => {
                return h("span", {}, this.switchDate(params.row.createDate, 1));
              },
            },
            {
              title: "修改时间",
              key: "updateTime",
              width: 180,
              render: (h, params) => {
                return h("span", {}, this.switchDate(params.row.updateDate, 1));
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
        },
      }
    };
  },
  mounted() {
    const urlParam = this.getUrlParam();
    this.namespaceId = urlParam.id;
    this.form.namespaceId = urlParam.id;
    this.page.file.param.namespaceId = urlParam.id;
    this.page.chunk.namespaceId = urlParam.id;
    this.list(1);
  },
  methods: {
    fromVisibelChange() {
      console.log("fromVisibelChange");
    },
    validataForm() {
      var _result = true;
      return _result;
    },
    successUpload(data) {
      this.$refs.upload.clearFiles();
      let that = this;
      that.bus.showFlag = false;
      that.fileList(1);
      that.$Modal.success({ 'title': '提示', 'content': '上传成功', });
    },
    errorUpload(data) {
      that.$Modal.error({ 'title': '提示', 'content': '操作失败' + data });
    },
    submitForm(formName) {
      if (formName == 'namespaceFileFrom') {
        if (this.validataForm()) {
          this.form.namespaceId = this.namespaceId;
          if (this.file) {
            // 手动触发上传
            this.$refs.upload.post(this.file);
          } else {
            // 基本信息修改
            this.axios.updateNamespaceFile(this.form).then(data => {
              this.$Modal.success({ 'title': '提示', 'content': '编辑成功' });
              this.bus.showFlag = false;
            }).catch(error => {
              console.log(error);
              this.$Modal.error({ 'title': '提示', 'content': '编辑失败' });
            });
          }
        }
      } else if (formName == 'chunkForm' && this.chunk.drawerTitle == '编辑') {
        // 分片编辑
        let param = this.chunk.form;
        this.Util.trimRequstObj(param);
        this.axios.updateVec(this.namespaceId, param).then(data => {
          if (data.data.code == '0') {
            this.$Modal.success({ 'title': '提示', 'content': '编辑成功' });
            this.bus.chunk.showFlag = false;
            this.chunkList(this.page.chunk.pageNum);
            this.$refs['chunkForm'].resetFields();
          } else {
            this.$Modal.error({ 'title': '编辑失败', 'content': '编辑失败' });
          }
        }).catch(error => {
          console.log("error: ", error)
          this.$Modal.error({ 'title': '编辑失败', 'content': '编辑失败' });
        });
      } else if (formName == 'chunkForm' && this.chunk.drawerTitle == '新增') {
        // 分片新增
        let param = this.chunk.form;
        this.Util.trimRequstObj(param);
        this.axios.insertVec(this.namespaceId, param).then(data => {
          if (data.data.code == '0') {
            this.$Modal.success({ 'title': '提示', 'content': '添加成功' });
            this.bus.chunk.showFlag = false;
            this.chunkList(this.page.chunk.pageNum);
            this.$refs['chunkForm'].resetFields();
          } else {
            this.$Modal.error({ 'title': '添加失败', 'content': '添加失败' });
          }
        }).catch(error => {
          console.log("error: ", error)
          this.$Modal.error({ 'title': '添加失败', 'content': '添加失败' });
        });
      }
    },
    cancelForm(formName) {
      if (formName == 'namespaceFileFrom') {
        this.bus.showFlag = false;
      } else if (formName == 'chunkForm') {
        this.bus.chunk.showFlag = false;
        this.chunkList(this.page.chunk.pageNum);
        this.$refs['chunkForm'].resetFields();
      }
    },
    addFile() {
      this.$refs['namespaceFileFrom'].resetFields();
      this.TreeText = '新增';
      this.form = {};
      this.form.name = '';
      this.bus.showFlag = true;
      this.bus.disabled = false;
    },
    editFile(row, index) {
      this.TreeText = '编辑';
      this.form = row;
      this.bus.uploadDisabled = true;
      this.bus.showFlag = true;
      this.bus.disabled = false;
    },
    detailsFile(row, index) {
      this.TreeText = '详情';
      this.form = row;
      this.bus.disabled = true;
      this.bus.showFlag = true;
    },
    downloadFile(row, index) {
      window.open("/api/namespace/file/download/" + row.id, "_blank");
    },
    previewFile(row, index) {
      window.open("/api/namespace/file/preview/" + row.id, "_blank");
    },
    deleteFile(row, index) {
      console.log(row)
      let _this = this;
      let param = { id: row.id }
      this.axios.deleteNamespaceFile(param).then(data => {
        if (data.data.code == '0') {
          _this.fileList(_this.page.file.pageNum);
          _this.$Modal.success({ 'title': '提示', 'content': '操作成功', });
        } else {
          this.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
        }
      })
    },
    showExcelPageWithRelation(row, index) {
      this.$router.push("/namespaceExcel?fileId=" + row.id + "&displayName=" + encodeURIComponent(row.displayName)+ "&id=" + this.namespaceId);
    },
    removeChunk(row, index) {
      let _this = this;
      let param = {
        fileId: row.id,
      }
      this.axios.removeChunk(param).then(data => {
        if (data.data.code == '0') {
          _this.fileList(_this.page.file.pageNum);
          _this.$Modal.success({ 'title': '提示', 'content': '操作成功', });
        } else {
          this.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
        }
      })
    },
    generateChunk(row, index) {
      let _this = this;
      let param = {
        fileId: row.id,
      }
	  if(row.vectorStatus == 'Wait' ){
		_this.generateChunkFlag = true;
		row.vectorStatus = 'Vectoring';
	  }
      this.axios.generateChunk(param).then(data => {
        if (data.data.code == '0') {
          _this.fileList(_this.page.file.pageNum);
		  console.log("row.vectorStatus4:",row.vectorStatus);
          _this.$Modal.success({ 'title': '提示', 'content': '操作成功', });
        } else {
          this.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
        }
		_this.generateChunkFlag = false;
      })
    },
    searchFile() {
      this.fileList(1);
    },
    changeFilePage(index) {
      this.page.file.pageNum = index;
      this.fileList(this.page.file.pageNum);
    },
    changeFilePageSize(pageSize) {
      this.page.file.pageSize = pageSize;
      this.fileList(this.page.file.pageNum);
    },
    list(pageNum) {
      this.fileList(pageNum);
      this.chunkList(pageNum);
    },
    fileList(pageNum) {
      this.page.file.pageNum = pageNum;
      let param = this.page.file;
      this.Util.trimRequstObj(param);
      this.axios.listNamespaceFile(param).then(data => {
        if (data.data.code == '0') {
          this.page.file.data = data.data.data.data;
          this.page.file.total = data.data.data.total;
        } else {
          this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
        }
      }).catch(error => {
        console.log("error: ", error)
        this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
      });
    },
    selectRelationExcel(item) {
      console.log(item.defList);
      // TODO 此处需要检查关联图表选择是否重复
    },
    addRelationOption() {
      this.chunk.form.metadata.images.push({
        index: this.chunk.relationCount++,
        excel_id: "",
        image_id: "",
      });
      this.$forceUpdate();
    },
    delRelationOption(item) {
      let _this = this;
      for (let i = 0; i < _this.chunk.form.metadata.images.length; i++) {
        let relation = _this.chunk.form.metadata.images[i];
        if (relation.index === item.index) {
          _this.chunk.form.metadata.images.splice(i, 1);
          this.$forceUpdate();
          break;
        }
      }
    },
    detailChunk(row, index) {
      this.$refs['chunkForm'].resetFields();
      this.chunk.drawerTitle = '详情';
      this.chunk.relationCount = 0;
      this.chunk.abcList = [];
      this.chunk.form = row;
      this.bus.chunk.editFlag = false;
      this.bus.chunk.showFlag = true;
      this.bus.chunk.readFlag = true;
      // 查询图表清单
      this.axios.findImagesVec({ fileId: row.fileId }).then(data => {
        if (data.data.code == '0') {
          this.chunk.excelList = data.data.data.excelList;
          for (let i = 0; i < this.chunk.excelList.length; i++) {
            let excel = this.chunk.excelList[i];
            let children = [];
            for (let j = 0; j < excel.imageList.length; j++) {
              let image = excel.imageList[j]
              children.push({
                value: image.imageId,
                label: image.markNum,
              });
            }
            this.chunk.abcList.push({
              value: excel.excelId,
              label: excel.name,
              children: children,
            });
          }
          // 回显关联图表
          if (this.chunk.form.metadata.images) {
            for (let i = 0; i < this.chunk.form.metadata.images.length; i++) {
              let relationItem = this.chunk.form.metadata.images[i];
              relationItem.defList = [relationItem.excel_id, relationItem.image_id];
            }
          } else {
            this.chunk.form.metadata.images = [];
          }
          this.$forceUpdate();
        } else {
          this.$Modal.error({ 'title': '获取失败', 'content': '获取关联图表信息失败' });
        }
      }).catch(error => {
        console.log(error);
        this.$Modal.error({ 'title': '获取失败', 'content': '获取关联图表信息失败' });
      });
    },
    updateChunk(row, index) {
      this.$refs['chunkForm'].resetFields();
      this.chunk.drawerTitle = '编辑';
      this.chunk.relationCount = 0;
      this.chunk.abcList = [];
      this.chunk.form = row;
      this.bus.chunk.readFlag = false;
      this.bus.chunk.showFlag = true;
      this.bus.chunk.editFlag = true;
      // 查询图表清单
      this.axios.findImagesVec({ fileId: row.fileId }).then(data => {
        if (data.data.code == '0') {
          this.chunk.excelList = data.data.data.excelList;
          for (let i = 0; i < this.chunk.excelList.length; i++) {
            let excel = this.chunk.excelList[i];
            let children = [];
            for (let j = 0; j < excel.imageList.length; j++) {
              let image = excel.imageList[j]
              children.push({
                value: image.imageId,
                label: image.markNum,
              });
            }
            this.chunk.abcList.push({
              value: excel.excelId,
              label: excel.name,
              children: children,
            });
          }
          // 回显关联图表
          if (this.chunk.form.metadata.images) {
            for (let i = 0; i < this.chunk.form.metadata.images.length; i++) {
              let relationItem = this.chunk.form.metadata.images[i];
              relationItem.defList = [relationItem.excel_id, relationItem.image_id];
            }
          } else {
            this.chunk.form.metadata.images = [];
          }
          this.$forceUpdate();
        } else {
          this.$Modal.error({ 'title': '获取失败', 'content': '获取关联图表信息失败' });
        }
      }).catch(error => {
        console.log(error);
        this.$Modal.error({ 'title': '获取失败', 'content': '获取关联图表信息失败' });
      });
    },
    createChunk() {
      this.$refs['chunkForm'].resetFields();
      this.chunk.form = {
        customId: '',
        fileId: '',
        document: '',
        metadata: {
          name: '',
          source: '',
          scene: '',
          answer: '',
          images: [],
        },
      }
      this.chunk.drawerTitle = '新增';
      this.chunk.relationCount = 0;
      this.chunk.abcList = [];
      this.bus.chunk.readFlag = false;
      this.bus.chunk.editFlag = false;
      this.bus.chunk.showFlag = true;
      this.$forceUpdate();
    },
    deleteChunk(row, index) {
      let _this = this;
      let namespaceId = _this.page.chunk.namespaceId;
      let fileId = row.fileId;
      this.axios.deleteVec(namespaceId, fileId, { data: [row.customId] }).then(data => {
        if (data.data.code == '0') {
          _this.list(_this.page.chunk.pageNum);
          _this.$Modal.success({ 'title': '提示', 'content': '操作成功', });
        } else {
          this.$Modal.error({ 'title': '提示', 'content': data.data.code + ":" + data.data.message });
        }
      }).catch(error => {
        console.log("error: ", error)
        this.$Modal.error({ 'title': '操作失败', 'content': '操作失败' });
      });
    },
    searchChunk() {
      this.chunkList(1);
    },
    changeChunkPage(index) {
      this.page.chunk.pageNum = index;
      this.chunkList(this.page.chunk.pageNum);
    },
    changeChunkPageSize(pageSize) {
      this.page.chunk.pageSize = pageSize;
      this.chunkList(this.page.chunk.pageNum);
    },
    chunkList(pageNum) {
      this.page.chunk.pageNum = pageNum;
      let param = this.page.chunk;
      this.Util.trimRequstObj(param);
      this.axios.pageVec(param).then(data => {
        if (data.data.code == '0') {
          this.page.chunk.data = data.data.data.data;
          this.page.chunk.total = data.data.data.total;
        } else {
          this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
        }
      }).catch(error => {
        console.log("error: ", error)
        this.$Modal.error({ 'title': '获取失败', 'content': '获取失败' });
      });
    },
    reloadExcelImages() {
      this.chunk.abcList = [];
      this.axios.findImagesVec({ fileId: this.chunk.form.fileId }).then(data => {
        if (data.data.code == '0') {
          this.chunk.excelList = data.data.data.excelList;
          for (let i = 0; i < this.chunk.excelList.length; i++) {
            let excel = this.chunk.excelList[i];
            let children = [];
            for (let j = 0; j < excel.imageList.length; j++) {
              let image = excel.imageList[j]
              children.push({
                value: image.imageId,
                label: image.markNum,
              });
            }
            this.chunk.abcList.push({
              value: excel.excelId,
              label: excel.name,
              children: children,
            });
          }
          this.$forceUpdate();
        } else {
          this.$Modal.error({ 'title': '获取失败', 'content': '获取关联图表信息失败' });
        }
      }).catch(error => {
        console.log(error);
        this.$Modal.error({ 'title': '获取失败', 'content': '获取关联图表信息失败' });
      });
    },
    handleUpload(file) {
      this.file = file;
      return true;
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
    switchDate(val, flag) {
      var _time = new Date();
      let _year = "",
        _month = "",
        _date = "",
        _hour = "",
        _minutes = "",
        _second = "";
      if (typeof val === "string") {
        let _val = val
          .replace(/-/g, "/")
          .replace("T", " ")
          .replace(/[.]\d*[+]\d*/g, "");
        _time = new Date(_val);
      } else {
        _time = val;
      }
      _year += _time.getFullYear();
      _month +=
        _time.getMonth() < 9
          ? "0" + (_time.getMonth() + 1)
          : _time.getMonth() + 1;
      _date += _time.getDate() < 10 ? "0" + _time.getDate() : _time.getDate();
      _hour +=
        _time.getHours() < 10 ? "0" + _time.getHours() : _time.getHours();
      _minutes +=
        _time.getMinutes() < 10 ? "0" + _time.getMinutes() : _time.getMinutes();
      _second +=
        _time.getSeconds() < 10 ? "0" + _time.getSeconds() : _time.getSeconds();

      if (flag === 2) {
        return _year + "-" + _month + "-" + _date;
      } else if (flag === 3) {
        return _hour + ":" + _minutes + ":" + _second;
      }
      return (
        _year +
        "-" +
        _month +
        "-" +
        _date +
        " " +
        _hour +
        ":" +
        _minutes +
        ":" +
        _second
      );
    },
  },
  watch: {
    $route(newValue, oldValue) {
      this.fileList(1);
    },
  },
};
</script>

<style lang="less">
.namespace-file-list {
  width: 100%;
  overflow: auto;

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
}

.relation-list {
  background-color: #f6f8fb;
  height: 200px;
  min-width: 200px;
  overflow-y: scroll;
  margin: 5px auto;

  .relation-list-buttom {
    padding-left: 5px;
    padding-top: 5px;
  }

  .relation-list-item {
    margin: 8px auto;
  }
}

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

.setstyle {
  min-height: 200px;
  padding: 0 !important;
  margin: 0;
  overflow: auto;
  cursor: default !important;
}
</style>
