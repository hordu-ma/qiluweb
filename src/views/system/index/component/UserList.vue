<template>
  <div class="app-container">
    <div class="adminHeard">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入搜索信息"
            clearable
            style="width: 240px"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </el-form-item>
        <el-button style="padding: 6px 20px" @click="handleQuery">查询</el-button>
        <el-button type="primary" style="margin-top: 2px" size="mini" @click="handleImport">批量导入</el-button>
      </el-form>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
          >导出</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            size="mini"
            :disabled="multiple"
            @click="handleDelete">删除
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div v-if="typeList.length">
      <el-table
        v-loading="loading"
        :data="typeList"
        :max-height="600"
        @selection-change="handleSelectionChange"
        border :header-cell-style="{ backgroundColor: '#f2f5fa',  }"	>
        <el-table-column type="selection" width="80" align="center"/>
        <el-table-column label="姓名"  prop="name"/>
        <el-table-column label="账号"  prop="username" :show-overflow-tooltip="true"/>
        <el-table-column label="身份证后六位"  prop="idCardSuffix" :show-overflow-tooltip="true"/>
        <el-table-column label="创建时间"  prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建人"  prop="creator" :show-overflow-tooltip="true"/>
        <el-table-column label="操作"  class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <span class="btn-box" @click="handleDelete(scope.row)">
              <el-link class="btn-del" :underline="false" type="primary">删除</el-link>  
            </span>
            <span class="btn-box" @click="handleEdit(scope.row)">
              <el-link :underline="false"  type="primary">编辑</el-link>
            </span>
            <!-- <el-button
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
            <el-button
              size="mini"
              type="text"
              @click="handleEdit(scope.row)"
            >编辑
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <pagination
        class="pagination"
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
    <el-empty v-else description="您还没有上传数据" :image="require('../../../../images/empty.png')">
      <el-button type="primary"  style="margin-top: 2px" size="mini" @click="handleImport">批量导入</el-button>
    </el-empty>
    <el-dialog title="编辑" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username"  placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="身份证后六位" prop="idCardSuffix" >
          <el-input v-model="form.idCardSuffix"  placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="form.createTime"
            disabled
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="创建人" prop="creator">
          <el-input disabled v-model="form.creator"  placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <ImportModal :open="importVisible" @handleReturn="handleReturn" v-if="importVisible" />
  </div>
</template>

<script>
import ImportModal from './ImportModal.vue'
import Pagination from "@/components/Pagination/index.vue"

export default {
  name: 'UserList',
  components: { ImportModal, Pagination },
  data() {
    return {
      loading: true,
      ids: [],
      open:false,
      multiple: true,
      importVisible:false,
      showSearch: true,
      total: 0,
      typeList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        param: {
          isAdmin: '0',
          name: '',
          username: '',
          createTime: '',
          updator: '',
        }
      },
      form: {},
      rules: {
        username: [
          { required: true, message: '账号不能为空', trigger: 'blur' },
          { min: 1, max: 64, message: '长度在 1 到 64 个字符', trigger: 'blur' },
        ],
        name: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        idCardSuffix: [
          { required: true, message: '身份证后六位不能为空', trigger: 'blur' },
          { min: 6, max: 6, message: '长度必须为 6 位', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!/^[\dXx]{6}$/.test(value)) {
                callback(new Error('请输入合法的身份证后六位'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询字典类型列表 */
    getList() {
      this.loading = true
      this.queryParams.param.username = this.queryParams.username || '';
      this.queryParams.param.name = this.queryParams.username || '';
      this.axios.userList(this.queryParams).then(res => {
       console.log('userList',res)
        if (res.data.code === '0') {
          this.typeList = res.data.data.data
          this.total = Number(res.data.data.total)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleReturn(){
      this.importVisible = false
    },
    handleImport() {
      this.importVisible = true
    },
    handleExport(){
      const param = { isAdmin: '0', }
      if (this.ids) {
        param.userIds = this.ids;
      }
      this.axios.exportUsers(param).then(data => {
          console.log('exportUsers',data)
					if (!data) {
						return
					}
          const link = document.createElement('a');
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' });
          const url = URL.createObjectURL(blob);

          const contentDisposition = data.headers['content-disposition'];
          let filename = '管理员列表.xlsx';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*?=(?:utf-8'')?"?([^";]+)"?/i);
              if (filenameMatch && filenameMatch[1]) {
                  filename = decodeURIComponent(filenameMatch[1]);
              }
          }
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
        }).catch(error => {
          console.log("error: ", error);
          this.$Modal.error({
            'title': '获取失败',
            'content': '获取失败'
          });
        });
    },
    handleEdit(row){
      this.open = true
      this.form =row
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    submitForm(){
      console.log(this.form)
      console.log(this.$refs.form)
      this.$refs.form.validate().then(() => {
        this.axios.updateUser(this.form).then(res => {
          if (res.data.code === '0') {
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.getList()
            this.open = false
          }
        }).catch(error => {
          this.$message.error(error?.message || '修改失败');
        })
      }).catch(error => {
        console.log('error', error)
      })
    },
    cancel(){
      this.open = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const dictIds = row.userId ? [row.userId] : this.ids
      console.log('dictIds', dictIds)
      let text =  row.userId ?  '确定删除当前信息吗?':'确定删除选中的信息吗?'
      this.$confirm(text, '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('删除提示', dictIds)
        this.axios.batchDeleteUsers({ userIds: dictIds}).then(res => {
          this.$message({
            type:'success',
            message: '删除成功!'
          });
          this.getList()
        }).catch(error => {
          this.$message.error(error?.message || '删除失败');

        })

      })
    }
  }
}
</script>

<style lang="less" scoped>
.adminHeard {
  display: flex;
  justify-content: space-between;
}
.btn-box{
  padding-left: 12px;
  padding-right: 4px;
}
.pagination {
  margin-top: 20px;
}
</style>
