<template>
  <div class="recognition">
    <div class="recognition_left">
      <h2 class="title"> <el-avatar :src="helper1" size="small"></el-avatar>
        <span class="chat-title">预警识别助手</span>
      </h2>
      <chatMarkdown :typeList="typeList" />
    </div>
    <div class="recognition_right">
      <div>
        <div class="item" v-for="item in typeList" :key="item.id">
          {{ item.name }}：
          <el-tooltip effect="dark" :content="item.fileName || '暂无名称'" placement="top-start">
            <div class="fileName">{{ item.fileName || '暂无名称' }}</div>
          </el-tooltip>
          <a @click="handleUpload(item.id)">上传</a>
        </div>
      </div>

      <div class="desc">
        在开始聊天前，请先上传所有相关文件。每种类型文件每次只能上传一个，但你可以多次重复上传不同的文件，系统会逐个接收。为确保我能全面理解你的需求，请在一开始就上传完整的资料。上传完成后，我将根据你提供的全部内容，集中处理、分析或生成所需内容。请注意，不支持打包上传，所以请按文件类型分别上传，确保信息清晰、完整，有助于我们更高效地展开接下来的沟通与协作。
      </div>
    </div>
    <el-dialog title="文件上传" :visible.sync="uploadVisible" width="40%"  class="start-file-box" >
      <el-form :model="form" :rules="rules" ref="myForm" label-width="100px">
        <!-- 上传组件 -->
        <el-form-item :label="uploadFileType[uploadType]+'文件'" prop="file">
          <el-upload ref="upload" drag action="/"
            :data="uploadData" :on-change="handleFileChange" :on-remove="handleFileRemove" 
            :beforeUpload="beforeUpload" :auto-upload="false" :file-list="fileList"
            :limit="1" accept=".xls,.xlsx">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">Click or drag files here to upload</div>
          </el-upload>
        </el-form-item>

        <!-- 其他表单字段 -->
        <el-form-item label="展示名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import chatMarkdown from './components/chatMarkdown.vue'
import helper1 from '@/images/helper1.png'
export default {
  components: {
    chatMarkdown
  },
  data() {
    // 自定义验证上传文件
    const validateFile = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error('请上传知识文件'));
      } else {
        callback();
      }
    };
    return {
      uploadFileType: {
        1: '针织材料',
        2: '设备状态材料',
        3: '生产计划',
      },
      helper1: helper1,
      uploadData: { displayName: 'test2.xlsx', type: 1 },
      typeList: [
        { name: '针织材料', id: 1, fileName: '' },
        { name: '设备状态材料', id: 2, fileName: '' },
        { name: '生产计划', id: 3, fileName: '' },
      ],
      uploadType: '',
      uploadVisible: false,
      form: {
        name: '',
        file: null
      },
      fileList: [],
      rules: {
        file: [
          { required: true, message: '请上传知识文件', trigger: 'change' }, // 添加 required: true
          { validator: validateFile, trigger: 'change' }
        ]
      },
    }
  },
  mounted() {
    this.getFileNames();
  },
  methods: {
    getFileNames() {
      const _this = this;
      _this.axios.getFileNames({}).then(data => {
        if (data.status === 200 && data.data.code === '0' && data.data.data) {
          if (data.data.data.materialFileName) {
            _this.typeList[0].fileName = data.data.data.materialFileName; // 更新文件名称
          }
          if (data.data.data.deviceFileName) {
            _this.typeList[1].fileName = data.data.data.deviceFileName; // 更新文件名称
          }
          if (data.data.data.planFileName) {
            _this.typeList[2].fileName = data.data.data.planFileName; // 更新文件名称
          }
        }
      });
    },
    beforeUpload(file) {
    },
    handleUpload(type) {
      this.uploadType = type
      this.uploadVisible = true
    },
    handleClose() {
      this.uploadVisible = false
      this.form = {
        name: '',
        file: null
      };
      // 清空文件列表
      this.fileList = [];
      // 重置表单验证状态
      if (this.$refs.myForm) {
        this.$refs.myForm.resetFields();
      }
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList;
      this.form.file = fileList.length > 0 ? fileList[0] : null;
      // 手动触发验证
      this.$refs.myForm.validateField('file');
    },
    // 移除文件时的处理
    handleFileRemove(file, fileList) {
      this.fileList = fileList;
      this.form.file = fileList.length > 0 ? fileList[0] : null;
      // 手动触发验证
      this.$refs.myForm.validateField('file');
    },
    handleSubmit() {
      const _this = this;
      this.$refs.myForm.validate((valid) => {
        if (valid) {
          // 构造表单数据
          const formData = new FormData();
          if (this.form.file) {
            formData.append('file', this.form.file.raw);
          }
          if (this.form.name) {
            formData.append('displayName', this.form.name);
          }
          formData.append('fileType', this.uploadType);
          // 这里可以发送到服务器
          console.log('表单验证通过，提交数据:', this.form);
          let index = this.typeList.findIndex(item => item.id === this.uploadType);
          this.typeList[index].fileName = this.form.name || this.form.file.name; // 更新文件名称

          _this.showLoading('上传中.....');
          _this.axios.uploadExcel(formData).then(data => {
              console.log(data);
              _this.$message.success('上传成功');
              if (data.status === 200 && data.data.code === '0') {

              } else {
 
              }
              _this.hideLoading();
          }).catch(error => {
              _this.$Modal.error({
                  'title': '上传失败',
                  'content': '上传附件失败'
              });
              _this.hideLoading();
          });

          this.handleClose()
        } else {
          this.$message.error('请填写完整表单内容');
          return false;
        }
      });
    },
  }
}
</script>
<style scoped lang="less">
.recognition {
  width: 100%;
  display: flex;
  justify-content: space-between;
  height: calc(~'100%' - 20px);
  margin: 10px;

  .recognition_left {
    width: 72%;
    height: 100%;
    border: 2px solid #e4e7ed;
    padding: 12px;
    display: flex;
    flex-direction: column;

    .title {
      margin: 10px 0px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chat-title {
      padding-left: 10px;
    }
  }

  .recognition_right {
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    border: 2px solid #e4e7ed;
    padding: 12px;
    width: 27%;
    height: 100%;

    .item {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      a {
        color: #2d8cf0;
      }

      .fileName {
        width: 80px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}

.help-class {
  width: 28px;
  height: 28px;
  // 让背景图覆盖整个元素
  background-size: cover; 
  // 防止背景图重复
  background-repeat: no-repeat; 
  // 居中显示背景图
  background-position: center; 
  border-radius: 100%;
}

.desc {
  border-top: 1px solid #e4e7ed;
  font-size: 14px;
  color: #909399;
  margin-top: 200px;
  padding-top: 10px;
  margin-bottom: 5px;
}

::v-deep{
  .el-upload-dragger {
    width: 100%;
  }
}
</style>
