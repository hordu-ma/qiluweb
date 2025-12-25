<template>
  <el-dialog title="批量导入" :visible="localOpen" center width="500px" append-to-body @close="handleClose">
    <el-form ref="form" :model="form"  label-width="80px">
      <el-form-item label="导入" prop="name">
        <el-upload
          class="upload-demo"
          v-model="form.file"
          :headers="uploadHeader"
          :action="actionUrl"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :on-change="handleChange"
          :limit="1"
          :on-exceed="handleExceed"
          :file-list="fileList">
          <el-button size="small" >上传文件</el-button>
          <div slot="tip" class="el-upload__tip">提示：支持上传xls、xlsx格式文件 <el-button type="text" @click="handleDownload">模板下载</el-button>  </div>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="handleClose">确 定</el-button>
  </span>
  </el-dialog>
</template>

<script>
import Util from "@/libs/util.js";

export default {
  props:{
    open:Boolean,
    isAdmin:String,
  },
  name: 'ImportModal',
  data(){
    return{
      localOpen: this.open,
      actionUrl:'/api/user/batchImportUsers',
      uploadHeader: {
       'Authorization': 'Bearer ' + Util.getSession('tmp_access_token')
      },
      form:{},
      fileList:[],
    }
  },
  mounted(){
    console.log(this.isAdmin)
    this.isAdmin && (this.actionUrl += '?isAdmin='+ !!this.isAdmin)
    console.log(this.actionUrl)
  },
  watch: {
    open(newVal) {
      this.localOpen = newVal;
    }
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
      this.fileList = fileList;
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1);
    },
    handleDownload() {
      this.axios.downloadTemplate({ isAdmin: !!this.isAdmin }).then(res => {
        console.log("res: ", res);
        const contentDisposition = res.headers['content-disposition'];
        let filename = this.isAdmin ? '管理员账号管理模板.xlsx' : '学生账号管理模板.xlsx';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*?=(?:utf-8'')?"?([^";]+)"?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = decodeURIComponent(filenameMatch[1]);
            }
        }
        const link = document.createElement('a');
        const url = URL.createObjectURL(res.data);
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // 清理资源
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        this.$message({
          type:'success',
          message: '下载成功!'
        });
      })
    },
    handleClose(){
      this.localOpen = false;
      this.$emit('update:open', false);
      this.$emit('handleReturn');
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    }
  }
}
</script>



<style scoped lang="less">

</style>
