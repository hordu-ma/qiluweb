<template>
  <div class="ange">
    <div class="topBox">
      <div class="backIcon" @click="handleBack">
        <i class="el-icon-back"></i>
      </div>
      <div class="isEditingTitle">
        <div class="title1" v-if="!isEditing">
          <div class="name">{{ queryParams.name }}</div>
          <span class="edit-box" @click="isEditing = true">
            <i class="el-icon-edit" @click="isEditing = true"></i>
          </span>
        </div>
        <el-input v-else v-model="queryParams.name" @blur="isEditing = false" @keyup.enter="isEditing = false" />
      </div>
      <el-button type="primary" style="width: 110px;padding: 5px 0px;border-radius: 10px" size="medium" @click="handleSave">保存</el-button>
    </div>

    <div class="content">
      <div class="left">
        <el-form :model="queryParams" :rules="rules" ref="queryForm" size="small"  label-width="78px">
          <el-form-item label="头像" prop="avatar">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :headers="uploadHeader"
              action="/api/pro-photo/bot/upload"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
              <!-- <img class="avatar" :src="queryParams.avatar ? baseUrl + queryParams.avatar : '../img.png'" alt=""> -->
              <!-- <img v-if="changeAvatar" src="../img.png" class="avatar" alt=""> -->
              <img v-if="changeAvatar && queryParams.avatar" :src="baseUrl + queryParams.avatar" class="avatar" alt="">
              <img v-else   class="avatar1" src="../img_2.png" alt="" />
            </el-upload>
          </el-form-item>
          <el-form-item label="模型选择" prop="llmsModels">
            <el-select v-model="checkList" placeholder="暂未选择模型(可多选)" multiple style="width: 800px" @change="handleChangeSelect">
              <el-option-group
                v-for="group in optionsArray"
                :key="group.title"
                :label="group.title">
                <el-option
                  v-for="item in group.children"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="提示词" prop="prompt">
            <el-input type="textarea" :autosize="{ minRows: 6, maxRows: 16}" v-model="queryParams.prompt"  style="width: 800px" placeholder="在这里编写系统提示词，包括角色设定、任务目标、具备的能力及回复的要求与限制等，好的提示词直接影响智能体效果"></el-input>
          </el-form-item>
          <el-form-item label="开场语" prop="welcomeTip">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="queryParams.welcomeTip" placeholder="将作为开启聊天的第一句话"  style="width: 800px"></el-input>
          </el-form-item>
          <el-form-item label="介绍" prop="introduction">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="queryParams.introduction" placeholder="示例：你的诊断报告智能助手"  style="width: 800px"></el-input>
          </el-form-item>
          <el-form-item label="分类" prop="botGroupIds" >
            <el-select clearable popper-class="custom-select"  v-model="queryParams.botGroupIds" placeholder="请为智能体选择分类"  style="width: 300px">
              <el-option v-for="group in groupList" :key="group.id" :label="group.botGroupName" :value="group.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <!-- <div class="right">
       <div class="textRender">
         <div v-for="(group, index) in optionsArray" :key="index">
           <div class="title">{{ group.title }}</div>
           <el-checkbox-group v-model="checkList" class="custom-checkbox-group">
             <el-checkbox
               v-for="item in group.children"
               :key="item.value"
               :label="item.value"
               border
               class="custom-checkbox"
             >
               <div class="checkbox-content">
                 <div class="checkbox-title">{{ item.label }}</div>
                 <div class="checkbox-desc">{{ item.desc }}</div>
               </div>
             </el-checkbox>
           </el-checkbox-group>
         </div>
       </div>
      </div> -->
    </div>
  </div>
</template>
<script>
// src\libs\util.js
import Util from "@/libs/util.js";

export default {
  name: 'AnageModal',
  props: {
    itemData: Object,
    groupData: Array,
  },
  data() {
    return {
      changeAvatar: false,
      uploadHeader: {
       'Authorization': 'Bearer ' + Util.getSession('tmp_access_token')
      },
      groupList: [],
      editTitle: '智能体',
      isEditing: false,
      checkList:[],
      options: [
        {
          label: 'a',
          value:'v1',
          title: 'Deepseek R1 满血版',
          desc: '擅长复杂任务处理与代码生成，适用于逻辑推理与开发类智能体'
        },
        {
          label: 'b',
          value:'v2',
          title: 'Qwen2.5 qwen-72B',
          desc: '单模态语言模型，语言理解与生成能力强，适合文本问答与内容生成'
        }
      ],
      options1: [
        {
          label: 'c',
          value:'v3',
          title: 'Qwen2.5 qwen-vl-72B',
          desc: '多模态大模型，支持图文输入，适合图像问答与视觉内容分'
        }
      ],
      rules: {
        avatar: [
          { required: true, message: '请上传头像', trigger: 'change' },
        ],
        name: [
          { required: true, message: '请输入智能体名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        prompt: [
          { required: true, message: '请输入提示词', trigger: 'blur' },
        ],
        welcomeTip: [
          { required: true, message: '请输入开场语', trigger: 'blur' },
        ],
        introduction: [
          { required: true, message: '请输入介绍', trigger: 'blur' },
        ],
        llmsModels: [
          { required: true, message: '请选择模型', trigger: 'change' },
        ],
      },
      modelOptions: [],
      optionsArray: [],
      queryParams:{
        avatar:'',
        name: '智能体',
        model:[],
        prompt:'',
        welcomeTip:'',
        introduction:'',
        llmsModels:'',
        classify:'',
      }
    }
  },
  created() {
    // this.queryParams = this.itemData
  },
  mounted() {
    console.log(this.itemData)
    console.log('botGroupIds', this.itemData.botGroupIds)
    this.groupList = this.groupData.filter(e => e.id !== 'all')
    console.log('groupList', this.groupList)
    this.queryParams = this.itemData
    this.queryParams = {
        ...this.itemData,
        botGroupIds: this.itemData.botGroupIds?.length>0 ? this.itemData.botGroupIds[0] : [],
    }
    if (this.itemData.avatar) {
      this.changeAvatar = true;
    }
    this.getConfig()
    // 把llmConfig的modelName属性值提取出来，放到一个数组中放到checkList中
    if (this.itemData.llmsModels) {
      const llmConfig = JSON.parse(this.itemData.llmsModels);
      const modelNames = Object.values(llmConfig).map(item => item.modelName);
      this.checkList = modelNames;
    }
  },
  methods:{
    getConfig(){
      this.axios.getBotKnowledgeConfig().then(res => {
        console.log('getBotKnowledgeConfig',res)
        const { optionsArray, modelOptions } = this.transformConfigToOptions(res)
        console.log(optionsArray)
        this.optionsArray = optionsArray;
        this.modelOptions = modelOptions;
      })
    },
    transformConfigToOptions(config) {
        const optionsArray = [];
        const modelOptions = [];
        const typeMap = {
            text: '文本生成（必选）',
            vl: '图文理解（选填）'
        };
        // 按类型分组
        const groupedByType = {};
        const orderedTypes = ['text', 'vl'];  // 定义排序顺序
        // 首先收集所有数据并按类型分组
        orderedTypes.forEach(type => {
            groupedByType[type] = [];
            config.data.data.forEach(provider => {
                provider.children.forEach(model => {
                    if (model.type === type) {
                        const optionItem = {
                            label: model.label,
                            value: model.value,
                            llms: provider.value,
                            modelName: model.value,
                            enableThinking: model.enableThinking,
                            desc: model.desc,
                            type,
                        };
                        groupedByType[type].push(optionItem);
                        modelOptions.push({
                            label: model.label,
                            value: model.value,
                            type,
                        });
                    }
                });
            });
        });
        // 构建optionsArray
        orderedTypes.forEach(type => {
            if (groupedByType[type] && groupedByType[type].length > 0) {
                optionsArray.push({
                    title: typeMap[type] || type,
                    children: groupedByType[type]
                });
            }
        });
        return { optionsArray, modelOptions };
    },
    idsToConfig(ids) {
      const config = {};

      // 遍历所有选项找到匹配的模型
      this.optionsArray.forEach(group => {
        group.children.forEach(item => {
          if (ids.includes(item.value)) {
            config[item.type] = {
              llms: item.llms,
              modelName: item.value,
            };
            if (item.enableThinking) {
              config[item.type].enableThinking = true;
            }
          }
        });
      });
      
      return JSON.stringify(config);
    },
    handleAvatarSuccess(res, file) {
      console.log('res',res)
      console.log('file',file)
      // {
      //   "requestId": "5571d8f0-5cf6-4bca-b338-fa65cc61dfe5",
      //   "code": "0",
      //   "message": "success",
      //   "success": true,
      //   "data": "/file/image/20250610/42ae411cda9547d68f651f74fbb145ae.jpg"
      // }

      this.queryParams.avatar = res.data;
      this.changeAvatar = true;
      this.$message.success('上传成功');
      console.log('this.queryParams',this.queryParams)
    },
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        this.$message.error('请上传图片文件');
      }
      // const isLt2M = file.size / 1024 / 1024 < 2;
      return isImage;
    },
    handleSave(){
      const requiredTipArray = [
        {
          name: 'name',
          tip: '请输入智能体名称',
        },
        {
          name: 'prompt',
          tip: '请输入智能体提示词',
        },
        {
          name: 'welcomeTip',
          tip: '请输入智能体欢迎提示',
        },
        {
          name: 'introduction',
          tip: '请输入智能体介绍',
        },
        {
          name: 'llmsModels',
          tip: '请选择智能体模型',
        },
      ];
      
      const emptyFields = requiredTipArray.filter(item => {
        if (item.name === 'llmsModels') return !this.checkList.length;
        if (item.name === 'botGroupIds') return !this.queryParams.botGroupIds;
        return !this.queryParams[item.name];
      });
      
      if (emptyFields.length) {
        this.$message.error(emptyFields[0].tip);
        return;
      }

      const llmsModels =this.idsToConfig(this.checkList);
      if (llmsModels && JSON.parse(llmsModels)) {
        const obj = JSON.parse(llmsModels);
        // 判断obj.text.modelName是否存在
        if (!obj?.text?.modelName) {
          this.$message.error('请选择文本生成模型');
          return;
        }
      }

      
      const submitParams = {
        ...this.queryParams,
        llmsModels: llmsModels,
        botGroupIds: this.queryParams.botGroupIds?.length>0 ? [this.queryParams.botGroupIds] :  [],
      }
      console.log('submitParams',submitParams)
      this.axios.createOrUpdateBot(submitParams).then(res => {
        this.$message.success('保存成功')
        setTimeout(() => {
          this.$emit('handleAgentClose',submitParams)
        }, 1500);
      })

      // this.$emit('handleAgentClose',{
      //   ...this.queryParams,
      //   ...this.checkList
      // })
    },
    handleChangeSelect(val) {
      // 创建一个map来记录每个type的最新选项
      const typeMap = new Map();
      
      // 遍历所有选中项，按type分组并保留最后一个
      val.forEach(value => {
        // 找到对应的item
        const item = this.optionsArray.flatMap(group => 
          group.children
        ).find(child => child.value === value);
        
        if (item) {
          typeMap.set(item.type, value);
        }
      });
      
      // 只保留每个type的最新选项
      const filteredVal = Array.from(typeMap.values());
      
      console.log('filtered selected values:', filteredVal);
      this.checkList = filteredVal;
    },
    handleBack(){
      this.$emit('handleAgentClose')
    }
  }
}
</script>


<style scoped lang="scss">
.ange {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;

  .topBox {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    padding-left: 33px;
    padding-right: 24px;
    border-bottom: 1px solid #e6e6e6;

    .backIcon {
      padding: 3px 5px;
      border-radius: 10px;
      border: 1px solid #8c939d;
      cursor: pointer;
      font-weight: bold !important;
    }

    .isEditingTitle {
      margin-right: auto;
      margin-left: 16px;

      .title1 {
        display: flex;
        align-items: center;

        .name {
          font-size: 14px;
          font-weight: bold;
        }

        i {
          cursor: pointer;
        }
      }
      .edit-box {
        padding: 13px;
      }
    }

  }
  .content{
    padding: 50px 100px;
    display: flex;
    justify-content: space-between;
    .left{
      .avatar-uploader{
        border-radius: 50%;
        .avatar{
          width: 50px;
          height: 50px;
        }
        .avatar1{
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
        }
      }
    }
    .right{
      width: 600px;
      box-shadow: 0 0 2px 4px #eaf8f6;
      border-radius: 10px;
      padding: 0px 20px;
      .textRender{
        .title{
  margin-top: 20px;
        }
      }
    }
  }
}
.custom-select .el-select-dropdown__item {
  display: flex;
  align-items: center;
  position: relative;
  margin: 0 10px;
  padding-left: 32px !important; /* 给左边空出图标位置 */
}
.custom-select .el-select-dropdown__item{
  margin-bottom: 5px;
}
.custom-select .el-select-dropdown__item.selected {
  background-color: #4db58f !important; /* 修改选中背景色 */
  color: #fff !important;
  font-weight: 500;
  border-radius: 6px;
}
.custom-select .el-select-dropdown__item.selected::after{
  content: "";
}
  /* 勾选图标样式 */
.custom-select .el-select-dropdown__item.selected::before {
  content: "\e6da";
  position: absolute;
  font-family: element-icons;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}
/* 美化复选框项整体 */
.custom-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
 margin-top: 20px;

  .custom-checkbox {
    border-radius: 12px;
    padding: 12px 16px !important;
    width: 100%;
    display: flex;
    align-items: center;
    background-color: #f9f9fc;
    min-height: 60px;
    height: auto;
    transition: all 0.2s;
    margin-left: 0px !important;
  }

  /* 隐藏默认 label 文本，因为我们用自定义插槽 */
  .custom-checkbox .el-checkbox__label {
    display: block;
    width: 100%;
    padding-left: 12px;
  }


}

/* 卡片式复选框样式 */

/* 复选框内容排版 */
.checkbox-content {
  display: flex;
  flex-direction: column;
}

.checkbox-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.checkbox-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.el-icon-back::before {
  font-weight: bold;
}
.titleBox .el-icon-circle-plus-outline::before {
  color: #000;
}

</style>
