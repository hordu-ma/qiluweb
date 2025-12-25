<template>
 <div class="bigContent">
   <div class="agents"  v-if="!agentVisible">
     <!-- <div class="left">
       <div class="titleBox">
         <div class="name">智能体列表</div>
         <el-button type="text" circle @click="editGroup()"><i class="el-icon-circle-plus-outline" ></i></el-button>
       </div>
       <div class="listBox">
         <div class="ul">
           <div :class="['li',item.id===selectItemId &&'selectLi']" v-for="item in classifyList" :key="item.id"
                @click="handleSelectGroup(item)"
           >
             <span>{{ item.botGroupName }}</span>
             <div class="options" v-show="item.id===selectItemId && item.id !== 'all'">
               <i class="el-icon-edit-outline" @click="editGroup(item)"></i>
               <i class="el-icon-delete" @click="handleCategoryDelete(item)"></i>
             </div>
           </div>
         </div>
       </div>
     </div> -->
     <div class="right">
       <div class="optionsBox">
         <el-tabs v-model="selectItemIndex" @tab-click="handleSelectGroup">
          <el-tab-pane :label="item.name" v-for="item in classifyList" :key="item.id" >{{ item.name }}</el-tab-pane>
        </el-tabs>
         <!-- <el-button style="padding: 6px 20px" @click="handleIptChange()">查询</el-button> -->
       </div>
       <div class="content">
         <div class="itemInfo" v-for="item in contentList" :key="item.id">
           <div class="topBox">
             <img class="bot-img" :src="item.avatar ? baseUrl + item.avatar : './img.png'" alt="">
             <span class="name">{{item.name}}</span>
             <el-dropdown placement="bottom" @command="handleSelect">
               <div class="options">...</div>
               <el-dropdown-menu slot="dropdown">
                 <el-dropdown-item :command="{ key: '1', item: item }"><i class="el-icon-edit-outline"></i>编辑</el-dropdown-item>
                 <el-dropdown-item :command="{ key: '2', item: item }"><i class="el-icon-delete"></i>删除</el-dropdown-item>
               </el-dropdown-menu>
             </el-dropdown>
           </div>
           <div class="info">{{item.introduction}}</div>
         </div>
       </div>
     </div>

   </div>
   <AnageModal v-else :itemData="selectItem" :groupData="classifyList" @handleAgentClose="handleAgentClose" />
   <el-dialog :title="isCreateGroup ? '创建分组':'编辑分组'" :visible.sync="groupShow" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="botGroupName">
          <el-input v-model="form.botGroupName" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleGroup">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

 </div>
</template>
<script>
import AnageModal from './components/AnageModal.vue'
export default {
  components:{
    AnageModal
  },
  data() {
    return {
      imageBaseUrl: '',
      isCreateGroup: false,
      groupShow: false,
      form: {},
      rules: {
        username: [
          { required: true, message: '字典类型不能为空', trigger: 'blur' }
        ]
      },
      baseImgUrl: 'http://47.236.254.2',
      searchMessage: '',
      agentVisible:false,
      classifyList: [
        { id: 0, name: '全部分类' ,
          children:[
            { id: 1, name: '通用智能体2', desc: '你的诊断助手你的诊断助手你的诊断助手你的诊断助手你的诊断助手' },
            { id: 2, name: '通用智能体23', desc: '你的智能体' },
          ]
        },
        { id: 1, name: '分类1',
          children:[
            { id: 1, name: '通用智能3535体2', desc: '你的诊断助手助手你的诊断助手' },
            { id: 2, name: '通用智能体23', desc: '你的智能体' },
          ]},
        { id: 2, name: '分类2' ,
          children:[
            { id: 1, name: '通用智能体2', desc: '你手你的诊断助手' },
            { id: 2, name: '通用智能体23', desc: '你的智wr3t34t345353能体' },
          ]},
        { id: 3, name: '分类3',
          children:[
            { id: 1, name: '通用智2424能体2', desc: '你的诊断助手你的诊断助手' },
            { id: 2, name: '通用智24能体23', desc: '你的智能体' },
            { id: 1, name: '通用智能体2', desc: '你的诊断助手你的诊断助手你的诊断助手你的诊断助手你的诊断助手' },
          ]},
        { id: 4, name: '分类4',
          children:[
            { id: 1, name: '通用32242体2', desc: '你的诊手你的诊断助手你的诊断助手你的诊断助手' },
            { id: 2, name: '通用智能体23', desc: '你的智能体' },
            { id: 1, name: '通用智35能体2', desc: '你的诊断助手你的诊断助手你的诊断助手你的诊断助手你的诊断助手' },
            { id: 1, name: '通用智能体2', desc: '你的诊断助手你的诊断助手你的诊断助手你的诊断助手你的诊断助手' },
          ]}
      ],
      contentList: [],
      botQueryParam: {
        pageNum: 1,
        pageSize: 200,
        param: {
          botGroupId: '',
          queryByGroup: false,
        }
      },
      selectItem: {},
      selectItemIndex: '0',
      selectItemId: 'all'
    }
  },
  mounted() {
    this.getGroupList()
    this.getSystemBotList()
  },
  methods: {
    cancel(){
      this.groupShow = false
    },
    handleGroup(){
      console.log('handleGroup')
      console.log(this.form)
      this.axios.createOrUpdateBotGroup(this.form).then(data => {
        console.log('createOrUpdateBotGroup', data)
        this.groupShow = false
        this.$message({
          type:'success',
          message: '保存成功!'
        });
      }).finally(() => {
        this.getGroupList()
      })
    },
    editGroup(item={}){
      this.isCreateGroup = item.id ? false : true
      this.form = item
      this.groupShow = true
    },
    getSystemBotList() {

      this.axios.listBot(this.botQueryParam).then(data => {
        console.log('listSystemBot', data)
        console.log(data.data.data)
        // avatar: "\\Users\\chunhao\\Desktop\\135612.png"
        // data.data.data.data.forEach(item => {
        //   // if (item.avatar) {
        //   //   item.headUrl = this.baseImgUrl + item.avatar
        //   // }
        // })

        this.contentList = data.data.data.data
      }).catch(err => {
        console.log(err)
      })
    },
    getGroupList() {
      this.axios.listGroup().then(data => {
        console.log('listGroup', data)
        // data.data.data增加一个全部分类
        data.data.data.unshift({ id: 'all', name: '全部分类',  })
        this.classifyList = data.data.data
      }).catch(err => {
        console.log(err)
      })
    },
    handleSelectGroup() {
      console.log('handleSelectGroup', this.selectItemIndex)
      this.selectItemId = this.classifyList[this.selectItemIndex].id
      this.selectItem = this.classifyList[this.selectItemIndex]
      this.botQueryParam.param.botGroupId = this.selectItemId === 'all' ? '' : this.selectItemId
      this.botQueryParam.param.queryByGroup = this.selectItemId !== 'all'
      this.getSystemBotList()
    },
    handleIptChange(val) {
      console.log(this.searchMessage)
      this.botQueryParam.queryKey = this.searchMessage ? 'name' : '';
      this.botQueryParam.queryValue = this.searchMessage? this.searchMessage : '';
      this.getSystemBotList()
    },
    handleCategoryDelete(val){
      this.$confirm('删除后，该分类下的智能体将自动移动到全部分类是否确认删除', '确认删除该分类？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.axios.deleteBotGroup(val).then(data => {
          console.log('deleteBotGroup', data)
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.classifyList =  this.classifyList.filter(x=>x.id!==val.id)
        })
      })
    },
    handleAgentClose(value){
      if(value){
        this.getSystemBotList()
      }
      this.agentVisible = false
    },
    toNew(){
      const randomChars = Math.random().toString(36).slice(2, 6);
      this.selectItem = { name: `智能体应用-${randomChars}` }
      this.agentVisible = true
    },
    handleSelect(val){
      console.log('handleSelect')
      console.log(val)
      if(val?.key=='2'){
        this.$confirm('确定删除选中的智能体吗？删除后信息将不可恢复', '删除提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.axios.delete(val.item).then(data => {
            console.log('deleteBot', data)
            this.$message({
              type:'success',
              message: '删除成功!'
            })
            this.contentList =  this.contentList.filter(x=>x.id!==val.item.id)
          })
        })
      }else{
        this.selectItem = val.item
        this.agentVisible = true
      }
    }
  }
}
</script>

<style  lang="less" scoped>
.bigContent{
  height: 100%;
  width: 100%;
  .agents {
    height: 100%;
    width: 100%;
    display: flex;
    gap: 6px;

    .left {
      width: 226px;
      height: 100%;
      border-radius: 10px;
      background-color: #ffffff;
      box-sizing: border-box;

      .titleBox {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        padding: 0px 20px;
        border-bottom: 1px solid #e6e6e6;

        .name {
          font-size: 14px;
          font-weight: 600;
        }
        :deep(.el-button--text) {
          color: #000;
          font-size: 16px;
        }
      }

      .listBox {
        padding: 0 6px;

        .listTitle {
          font-size: 13px;
          margin-left: 16px;
        }

        .ul {
          padding: 0 3px;
          margin-top: 10px;
          overflow-y: auto;
          max-height: calc(~'100%' - 50px);

          .li {
            padding: 10px 13px;
            font-size: 13px;
            // margin-top: 8px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .options {
              display: flex;
              gap: 5px;
            }
          }

          .li:hover {
            background-color: #f1f1f1;
          }

          .selectLi {
            background-color: #f1f1f1;
          }
        }
      }
    }

    .right {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      background-color: #ffffff;

      .optionsBox {
        // display: flex;
        // justify-content: flex-end;
        // align-items: center;
        height: 50px;
        width: 100%;
        // padding: 0px 20px;
        // border-bottom: 1px solid #e6e6e6;
        // gap: 20px;
        ::v-deep {
          .el-button {
            margin-left: 0;
          }
        }
      }

      .content {
        padding: 14px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        overflow-y: auto;
        max-height: calc(~'100%' - 50px);

        .itemInfo {
          padding: 20px 25px;
          height: 125px;
          width: 280px;
          border: 1px solid #8bd0c5;
          border-radius: 10px;
          box-shadow: 0 0 2px 2px #8bd0c5;
          .topBox {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            .name {
              margin-left: 5px;
              margin-right: auto;
              font-size: 14px;
              font-weight: 600;
              margin-top: 5px;
            }

            .options {
              cursor: pointer;
              font-weight: 600;
            }
          }
          .bot-img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
          }

          .info {
            margin-left: 5px;
            margin-top: 10px;
            font-size: 12px;
            color: #d0cbcb
          }
        }
      }
    }
  }
  ::v-deep {
    .el-tabs__content {
      display: none;
    }
  }
}

</style>
