<template>
  <div class="chat-home">

    <!-- 聊天内容区 -->
    <el-main class="chat-content" ref="chatContent">
      <div v-if="welcomeShow" class="welcome-box">
        <img :src="robotInfo.avatar ? baseUrl+robotInfo.avatar : '/images/chatLogo.png'" class="welcome-img" />
        <div class="welcome-text">{{ robotInfo.welcomeTip || '请问您有什么问题？' }}</div>
      </div>
      <div v-for="(item, index) in msgList" :key="index" :id="'msg-' + index" class="msg-row">
        <!-- 机器人消息 -->
        <div v-if="item.speaker === 'server'" class="msg-left">
          <img :src="robotInfo.avatar ? baseurl+robotInfo.avatar : '/images/chatLogo.png'" class="avatar" />
          <div class="msg-content">
            <div v-if="item.thinking" class="msg-deep-box">
              <div class="deep-title" @click="toggleThinking(index)">
                {{ item.isThinking ? '深度思考中' : '已完成思考' }}
                <i :class="item.hideThinking ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
              </div>
              <div v-if="!item.hideThinking" class="deep-text">{{ item.thinking }}</div>
              <div class="deep-line"></div>
            </div>
            <div v-html="item.content"></div>
            <div class="msg-icons" v-if="item.id">
              <el-button type="text" icon="el-icon-thumb" :style="{color: item.answerLike === 'LIKE' ? '#2878ff' : '#979797'}" @click="handleLike(item)"></el-button>
              <el-button type="text" icon="el-icon-thumb" :style="{color: item.comment ? '#2878ff' : '#979797', transform:'scaleY(-1)'}" @click="handleUnlike(item)"></el-button>
            </div>
          </div>
        </div>
        <!-- 用户消息 -->
        <div v-else class="msg-right">
          <div v-if="item.filesUrl && item.isImage" class="msg-images">
            <img v-for="(img, imgIndex) in item.filesUrl" :key="imgIndex" :src="img.imgUrl" class="msg-img" @click="previewImage(img.imgUrl)" />
          </div>
          <div v-if="item.filesUrl && !item.isImage" class="msg-files">
            <div v-for="(file, fileIndex) in item.filesUrl" :key="fileIndex" class="msg-file">
              <i class="el-icon-document"></i>
              <span>{{ file.fileName }}</span>
              <span>{{ file.fileType }} {{ file.fileSizeMB }}</span>
              <el-button type="text" icon="el-icon-close" @click="handleDeleteFile(fileIndex)"></el-button>
            </div>
          </div>
          <div class="msg-content">{{ item.content }}</div>
        </div>
      </div>
    </el-main>

    <!-- 输入区 -->
    <el-footer height="auto" class="chat-input">
      <el-row :gutter="10" align="middle">
        <el-col :span="20">
          <el-input
            v-model="ques"
            :disabled="isLoading"
            placeholder="有什么问题尽管问我"
            @keyup.enter.native="createGroup"
            clearable
          ></el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-s-promotion" :loading="isLoading" @click="createGroup">发送</el-button>
        </el-col>
      </el-row>
      <div class="upload-bar">
        <el-upload
          action="/api/upload"
          :on-success="handleUploadSuccess"
          :file-list="fileList"
          :limit="1"
          :auto-upload="true"
        >
          <el-button size="mini" icon="el-icon-upload">上传文件</el-button>
        </el-upload>
        <el-upload
          action="/api/upload"
          :on-success="handleImageUploadSuccess"
          :file-list="imageList"
          :limit="maxImageCount"
          :auto-upload="true"
          list-type="picture-card"
        >
          <el-button size="mini" icon="el-icon-picture">上传图片</el-button>
        </el-upload>
      </div>
    </el-footer>

    <!-- 历史会话弹窗 -->
    <el-dialog title="历史会话" :visible.sync="showHistory" width="30%">
      <el-input v-model="sessionValue" placeholder="搜索会话..." @input="onGroupSearch" />
      <el-collapse>
        <el-collapse-item v-for="group in historyInfoList" :key="group.type" :title="group.type">
          <el-list>
            <el-list-item v-for="item in group.children" :key="item.id">
              <span>{{ item.groupName }}</span>
              <el-button type="text" icon="el-icon-edit" @click="editGroupName(item)"></el-button>
              <el-button type="text" icon="el-icon-delete" @click="deleteGroup(item)"></el-button>
            </el-list-item>
          </el-list>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msgList: [],
      ques: '',
      isLoading: false,
      fileList: [],
      imageList: [],
      maxImageCount: 5,
      robotAvatar: '',
      robotInfo: {},
      welcomeShow: true,
      showHistory: false,
      sessionValue: '',
      historyInfoList: [],
    };
  },
  mounted() {
    // 初始化机器人信息、欢迎语等
    // TODO: 拉取机器人信息
    this.robotInfo = { name: '医知立方', welcomeTip: '请问您有什么问题？' };
    this.robotAvatar = '/images/logo.png';
    this.getRobotInfo();
  },
  methods: {
    getRobotInfo() {
      const robotInfo = this.Util.getLocal('robotInfo');
      console.log('getRobotInfo', robotInfo);
      if (robotInfo) {
        this.robotInfo = robotInfo;
        return;
      }
      this.axios.getDefaultBot().then(res => {
        console.log('getDefaultBot', res);
        this.robotInfo = res.data.data;
      });
    },
    toggleThinking(index) {
      this.$set(this.msgList[index], 'hideThinking', !this.msgList[index].hideThinking);
    },
    handleLike(item) {
      // 点赞逻辑
      item.answerLike = item.answerLike === 'LIKE' ? 'NO_LIKE' : 'LIKE';
      // TODO: 调用后端接口
    },
    handleUnlike(item) {
      // 点踩逻辑
      // TODO: 弹窗收集反馈
    },
    handleDeleteFile(index) {
      this.fileList.splice(index, 1);
    },
    handleUploadSuccess(response, file, fileList) {
      // 文件上传成功
      this.fileList = fileList.map(f => ({
        fileName: f.name,
        fileType: f.name.split('.').pop().toUpperCase(),
        fileSizeMB: (f.size / 1024 / 1024).toFixed(2) + 'MB',
        filePath: f.url || f.response.url,
      }));
    },
    handleImageUploadSuccess(response, file, fileList) {
      // 图片上传成功
      this.imageList = fileList.map(f => ({
        imgUrl: f.url || f.response.url,
      }));
    },
    previewImage(url) {
      window.open(url, '_blank');
    },
    createGroup() {
      if (!this.ques) return;
      // 发送消息逻辑
      this.msgList.push({
        speaker: 'customer',
        contentType: 'text',
        filesUrl: this.imageList.length > 0 ? this.imageList : this.fileList,
        isImage: this.imageList.length > 0,
        content: this.ques,
      });
      this.ques = '';
      this.fileList = [];
      this.imageList = [];
      this.scrollToBottom();
      // TODO: 调用后端接口
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatContent;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    onGroupSearch(val) {
      // 搜索历史会话
      // TODO: 调用后端接口
    },
    editGroupName(item) {
      // 重命名逻辑
      // TODO: 弹窗输入新名称并保存
    },
    deleteGroup(item) {
      // 删除会话逻辑
      // TODO: 调用后端接口
    },
  },
};
</script>

<style scoped>
.chat-home {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.nav-bar {
  background: #10A593;
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.chat-content {
  flex: 1;
  overflow-y: auto;
  background: #f6f6f7;
  padding: 20px;
}
.msg-row {
  margin-bottom: 20px;
  display: flex;
}
.msg-left {
  display: flex;
  align-items: flex-start;
}
.msg-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 10px;
}
.msg-content {
  background: #fff;
  border-radius: 10px;
  padding: 10px 16px;
  max-width: 60vw;
  word-break: break-all;
}
.msg-images {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.msg-img {
  width: 100px;
  height: 100px;
  margin-right: 8px;
  border-radius: 6px;
  cursor: pointer;
}
.msg-files {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}
.msg-file {
  display: flex;
  align-items: center;
  background: #f5f6f7;
  border-radius: 6px;
  padding: 4px 8px;
  margin-bottom: 4px;
}
.welcome-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0;
}
.welcome-img {
  width: 120px;
  height: 120px;
  border-radius: 16px;
}
.welcome-text {
  margin-top: 20px;
  font-size: 18px;
  color: #333;
}
.chat-input {
  background: #fff;
  padding: 10px 20px;
  border-top: 1px solid #eee;
}
.upload-bar {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.deep-title {
  font-weight: bold;
  cursor: pointer;
}
.deep-text {
  color: #888;
  margin: 6px 0;
}
.deep-line {
  border-bottom: 1px dashed #ccc;
  margin: 6px 0;
}
.msg-icons {
  margin-top: 8px;
}
</style>