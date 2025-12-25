<template>
  <div class="chat-home">
    <div class="bot-name">医知立方 MediQube</div>
    <!-- 聊天内容区 -->
    <el-main class="chat-content" ref="chatContent">
      <div v-if="welcomeShow" class="welcome-box">
        <img :src="robotInfo.avatar ? baseUrl+robotInfo.avatar : '/images/chatLogo.png'" class="welcome-img" />
        <div class="welcome-text">{{ robotInfo.welcomeTip || '请问您有什么问题？' }}</div>
        <div class="input-box">
          <div class="operation-buttons">
            <el-button size="medium" round><i class="iconfont icon-wangyuanjing"></i>深度思考</el-button>
          </div>
          <div class="input-wrap">
            <div v-if="fileList.length>0" class="file-box">
              <div class="file-item" v-for="(file, index) in fileList" :key="index">
                <img :src="iconPdf" class="file-icon" />
                <div class="file-info">
                  <div class="file-name">{{ file.fileName }}</div>
                  <div class="file-size">{{ file.fileType }} {{ file.fileSizeMB }}</div>
                </div>
                <i class="el-icon-error" @click="handleDeleteFile(index)"></i>
              </div>
            </div>

            <div class="textarea-box">
              <el-input
                class="input-textarea"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4}"
                placeholder="请输入内容"
                v-model="ques">
              </el-input>
              <el-popover
                placement="top"
                trigger="hover"
                width="160">
                <div>
                 <el-button icon="el-icon-document" size="mini" type="text" @click="openUploadFile">上传文件</el-button> 
                </div>
                <div>
                  <el-button icon="el-icon-picture-outline" type="text" size="mini" @click="visibleUploadMenu = false">上传图片</el-button>
                </div>
                <span slot="reference" class="textarea-icon el-icon-circle-plus-outline">
                </span>
              </el-popover>
              <i @click="createGroup" class="textarea-icon el-icon-position"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="msg-box">
      <div v-for="(item, index) in msgList" :key="index" :id="'msg-' + index" class="msg-row">
        <!-- 机器人消息 -->
        <div v-if="item.speaker === 'server'" class="msg-left">
          <img :src="robotInfo.avatar ? baseUrl+robotInfo.avatar : '/images/chatLogo.png'" class="avatar" />
          <div class="msg-content">
            <div v-if="item.thinking" class="msg-deep-box">
              <div class="deep-title" @click="toggleThinking(index)">
                {{ item.isThinking ? '深度思考中' : '已完成思考' }}
                <i :class="item.hideThinking ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
              </div>
              <div v-if="!item.hideThinking" class="deep-text">{{ item.thinking }}</div>
              <div class="deep-line"></div>
            </div>
            <div v-html="renderMarkdown(item.content)"></div>
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
      </div>

      <!-- 输入区 -->
      <el-footer v-if="!welcomeShow" height="auto" class="chat-input">
        <div class="input-box">
          <div class="operation-buttons">
            <el-button size="medium" round><i class="iconfont icon-wangyuanjing"></i>深度思考</el-button>
          </div>
          <div class="input-wrap">
            <div v-if="fileList.length>0" class="file-box">
              <div class="file-item" v-for="(file, index) in fileList" :key="index">
                <img :src="iconPdf" class="file-icon" />
                <div class="file-info">
                  <div class="file-name">{{ file.fileName }}</div>
                  <div class="file-size">{{ file.fileType }} {{ file.fileSizeMB }}</div>
                </div>
                <i class="el-icon-error" @click="handleDeleteFile(index)"></i>
              </div>
            </div>

            <div class="textarea-box">
              <el-input
                class="input-textarea"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4}"
                placeholder="请输入内容"
                v-model="ques">
              </el-input>
              <el-popover
                placement="top"
                trigger="hover"
                width="160">
                <div>
                  <div>
                  <el-button  size="mini" type="text" @click="visibleUploadMenu = false">上传文件</el-button> 
                  </div>
                  <div>
                    <el-button type="text" size="mini" @click="visibleUploadMenu = false">上传图片</el-button>
                  </div>
                </div>
                <i slot="reference" class="textarea-icon el-icon-circle-plus-outline" @click.stop="showUploadMenu"></i>
                 <!-- <el-button slot="reference">click 激活</el-button> -->
              </el-popover>
              <span @click="createGroup" class="textarea-icon el-icon-position"></span>
            </div>
          </div>
        </div>
      </el-footer>

    </el-main>


    <el-dialog
      :visible.sync="visibleUploadFile"
      width="610px"
    >
      <el-upload
        :action="uploadUrl"
        :on-success="handleUploadSuccess"
        :file-list="fileList"
        :limit="1"
        :auto-upload="true"
      >
        <div>
          <div class="upload-title">上传文件</div>
          <div class="upload-area">
            <span>上传文件</span>
            <el-button size="mini" type="primary">点击上传</el-button> 
          </div>
          <div class="upload-desc">仅支持上传1个文件，文件大小不能超过10M。文件格式支持PDF、TXT、WORD、EXCEL。</div>
          <div class="upload-btn">
            <el-button size="mini">取消</el-button> 
            <el-button size="mini" type="primary">确认</el-button> 
          </div>
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import iconExcel from "@/images/excel.png";
import iconPdf from "@/images/pdf.png";
import iconWord from "@/images/word.png";
import iconTxt from "@/images/txt.png";
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import {fetchEventSource} from '@microsoft/fetch-event-source';
import { eventBus } from '@/libs/eventBus.js'

let msgList = [];
export default {
  data() {
    return {
      uploadUrl: '/api/chat-file/upload',
      needSend: true,
      enableQuesOptimizer: false,
      visibleUploadFile:false,
      visibleUploadMenu: false,
      iconExcel,
      iconPdf,
      iconWord,
      iconTxt,
      msgList: [],
      ques: '',
      isLoading: false,
      fileList: [],
      // fileList: [
      //   { fileType: 'PDF', fileName: '检查报告2024年9月25日 10:20:23胸部X光.pdf', fileSizeMB: '4MB'  },
      // ],
      imageList: [],
      maxImageCount: 5,
      robotAvatar: '',
      robotInfo: {},
      welcomeShow: true,
      showHistory: false,
      sessionValue: '',
      actionList: [{name: '上传文件'}],
      historyInfoList: [],
    };
  },
  created() {
    eventBus.$on('groupUuid', (groupUuid) => {
      console.log('on groupUuid', groupUuid);
      this.groupUuid = groupUuid;
      this._getHistoryList();
    })
    eventBus.$on('toNew', () => {
      console.log('on toNew');
      this.resetChat()
    })
  },
  beforeDestroy() {
    eventBus.$off('groupUuid')
    eventBus.$off('toNew')
  },
  mounted() {
    this._getRobotInfo();
    // this._getHistoryGroupList();
  },
  methods: {
    openUploadFile() {
      this.visibleUploadFile = true;
      this.visibleUploadMenu = false;
    },
    showUploadMenu() {
      console.log('showUploadMenu');
      this.visibleUploadMenu = !this.visibleUploadMenu;
      console.log(this.visibleUploadMenu);
    },
    resetChat(noWelcome=false) {
      console.log('resetChat');
      const _this = this;
      if (this.ctrl && this.ctrl.aborted) {
        _this.ctrl.abort();
      }

      msgList = [];
      _this.msgList = [];
      _this.groupUuid = '';
      _this.needSend = true;
      _this.uploadFileList = [];
      _this.imageList = [];
      _this.fileList = [];
      _this.welcomeShow = true;

    },
    updateMsgList(msgList) {
      // console.log('updateMsgList', msgList);
      const _this = this;
      this.msgList = msgList;
      this.ques = '';
      _this.pageScrollToBottom()
    },
    sseMessage() {
      let _this = this
      let count = 0;
      this.ctrl = new AbortController();
      let responseText = '';
      const requesInputMessage = this.ques;
      // this.ques = '';
      fetchEventSource('/api/bsp/chat/getSseEmitter', {
          method: 'GET',
          headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Authentication': _this.Util.getSession('tmp_access_token'),
          },
          //重连时间间隔，单位：毫秒，默认45000毫秒，这里设置为1000分钟
          // heartbeatTimeout: 1000 * 60 * 1000,
          heartbeatTimeout: 10 * 1000,
          signal: _this.ctrl.signal,
          openWhenHidden: true,
          async onopen(response) {
              console.log('onopen: ', response)
          },
          onmessage(ev) {
            console.log('onmessage: ', ev)
            // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            let newData = ev.data.trim();
            // 增加判断newData是否有效的JSON
            let parsedData = null
            if (!newData || newData !== '[DONE]') {
              parsedData = JSON.parse(newData)
            }
            console.log('parsedData:', parsedData);
            if (_this.needSend && ev.id && ev.id.length>10) {
              console.log('requesInputMessage:', requesInputMessage);
              _this.needSend = false
              _this._streamSessionChat(ev.id)
            } else if (ev.data === '[DONE]') { // 接收到结束标记，结束SSE连接
              console.log('stop:');
              _this.ctrl.abort();
              _this.isLoading = false;
            } else if (parsedData && parsedData.botId) { // text  thinking
              const res = parsedData;
              const lastMsgItem = msgList[msgList.length - 1];
              let oldMessage = res?.thinking ? (lastMsgItem?.thinking || '') : (lastMsgItem?.content || '');
              oldMessage = oldMessage? oldMessage : '';
              const oldThinking = lastMsgItem?.thinking || '';
              msgList.splice(msgList.length - 1, 1)
      
              if (res?.thinking) {
                const newMsg = {
                  speaker: 'server',
                  contentType: 'text',
                  isThinking: true,
                  id: lastMsgItem?.id || '',
                  thinking: oldThinking + res.thinking,
                }
                msgList.push(newMsg);
                _this.updateMsgList(msgList, true);
              } else if (res?.text) {
                const newMsg = {
                  speaker: 'server',
                  contentType: 'text',
                  isThinking: false,
                  thinking: oldThinking,
                  id: lastMsgItem?.id || '',
                  content: oldMessage + res.text,
                }
                msgList.push(newMsg);
                // console.log('newMsg', newMsg);
                _this.updateMsgList(msgList, true);
              }
              
            }
          },
          onclose(res) {
            console.log('onclose: ', res)
            _this.ctrl.abort()
          },
          onerror(err) {
            console.error('onerror: ', err)
            _this.chartError();
          }
      });
    },
    _streamSessionChat(sseEmitterId) {
      const _this = this;
      console.log('sseEmitterId', sseEmitterId)
      try {
        const paramData = {
          sseEmitterId: sseEmitterId, message: _this.ques, botId: _this.robotInfo.botId,
          groupUuid: _this.groupUuid, enableQuesOptimizer: _this.enableQuesOptimizer, 
        };
        const hasFiles = _this.fileList.length > 0 || _this.imageList.length > 0;
        if (hasFiles) {
          paramData.files = _this.fileList.length>0 ? _this.fileList : _this.imageList;
          paramData.files = JSON.parse(JSON.stringify(paramData.files));
          paramData.files.forEach(item => {
            item.fileType =  _this.fileList.length>0 ? 'file': 'img'
          })
        }
        this.axios.streamSessionChat(paramData).then((data) => {
          console.log('streamSessionChat:', data);
          _this.sendMessage()
          if (_this.welcomeShow) {
            _this.welcomeShow = false;
          }
        })
      } catch (error) {
        console.log('streamSessionChat error:', error);
      }
    },
    sendMessage: function (e) {
      const isImage = (this.fileList?.length > 0) ? false : true;
      console.log('isImage', isImage);
      console.log('sendMessage', e);
      console.log('fileList', this.fileList);
      console.log('imageList', this.imageList);
      msgList.push({
        speaker: 'customer',
        contentType: 'text',
        filesUrl: isImage ? this.imageList : this.fileList,
        isImage: isImage,
        content: this.ques
      })
      msgList.push({
        speaker: 'loading',
        contentType: 'gif',
        content: ""
      })
      console.log('msgList', msgList);
      // this.setData({
      //   msgList,
      //   inputVal,
      //   ques: '',
      //   uploadFileList: [],
      //   needSend: true,
      //   textEditing: true,
      //   fileList: [],
      //   imageList: []
      // });
      /// TODO 小程序写法转换
      this.msgList = msgList;
      this.ques = '';
      this.needSend = true;
      this.fileList = [];
      this.imageList = [];
      this.pageScrollToBottom()
    },

    createGroup() {
      console.log('createGroup');
      const _this = this;
      if (_this.isLoading) {
        return;
      }
      if (!_this.ques || _this.ques.trim() === '') {
        this.$message.warning('请输入内容');
        return;
      }
      if (_this.groupUuid) {
        this.isLoading = true;
        _this.sseMessage();
        return;
      }
      try {
        this.axios.createHistoryGroup({ botId: _this.robotInfo.botId, userId: _this.robotInfo.userId, groupName: _this.ques }).then((data) => {
          console.log('createHistoryGroup:', data);
          msgList = [];
          this.groupUuid = data.groupUuid;
          this.groupName = _this.ques;
          this.msgList = [];
          // _this.setData({
          //   needSend: true, isLoading: true, isVoiceLoading: false,
          //   popupShow: false, scrollTop: '',
          //   menuShow: false, selectHistoryitem: '', selectHistoryUid: '', menuTop: 0,
          // });
          /// TODO 小程序写法转换

          _this.sseMessage();
        })
      } catch (error) {
        this.loading = false;
        this.$message.error('请求失败');
      }
    },
    // _getHistoryGroupList(groupName="") {
    //   const _this = this;
    //   return new Promise((resolve, reject) => {
    //     try {
    //       this.axios.listGroupHistory({
    //         "pageNum": 1,
    //         "pageSize": 1000,
    //         "param": {
    //             "botId": _this.robotInfo.botId,
    //             "groupName": groupName
    //         }
    //       }).then((data) => {
    //         console.log('getHistoryGroupList:', data);
    //         _this.splitGoupList(data.data.data.data);
    //         resolve(data.data.data.data);
    //       }).catch(reject)
    //     } catch (error) {
    //       reject(error);
    //     }
    //   });
    // },
    // splitGoupList(data) {   
    //   console.log('splitGoupList', data);
    //   if (!data || data.length === 0) {
    //     this.historyInfoList = []
    //     return;
    //   }
    //   // 获取当前时间
    //   const now = new Date();
    //   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
    //   // 初始化分类结果
    //   const categorizedData = {
    //       today: [],
    //       yesterday: [],
    //       last7Days: [],
    //       last6Months: [],
    //       lastYear: [],
    //       others: []
    //   };

    //   // 遍历数据并分类
    //   data.forEach(item => {
    //       const createDate = new Date(item.createTime);
    //       const createDay = new Date(createDate.getFullYear(), createDate.getMonth(), createDate.getDate());
    //       const timeDiff = today - createDay;
    //       const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
    //       if (daysDiff === 0) {
    //           categorizedData.today.push(item);
    //       } else if (daysDiff === 1) {
    //           categorizedData.yesterday.push(item);
    //       } else if (daysDiff <= 7) {
    //           categorizedData.last7Days.push(item);
    //       } else if (daysDiff <= 180) {
    //           categorizedData.last6Months.push(item);
    //       } else if (daysDiff <= 365) {
    //           categorizedData.lastYear.push(item);
    //       } else {
    //           categorizedData.others.push(item);
    //       }
    //   });

    //   // 将分类结果转换为需要的格式
    //   const historyInfoList = [];
      
    //   if (categorizedData.today.length > 0) {
    //       historyInfoList.push({
    //           type: "今天",
    //           children: categorizedData.today
    //       });
    //   }
    //   if (categorizedData.yesterday.length > 0) {
    //       historyInfoList.push({
    //           type: "昨天",
    //           children: categorizedData.yesterday
    //       });
    //   }
    //   if (categorizedData.last7Days.length > 0) {
    //       historyInfoList.push({
    //           type: "最近7天",
    //           children: categorizedData.last7Days
    //       });
    //   }
    //   if (categorizedData.last6Months.length > 0) {
    //       historyInfoList.push({
    //           type: "最近半年",
    //           children: categorizedData.last6Months
    //       });
    //   }
    //   if (categorizedData.lastYear.length > 0) {
    //       historyInfoList.push({
    //           type: "最近一年",
    //           children: categorizedData.lastYear
    //       });
    //   }
    //   if (categorizedData.others.length > 0) {
    //       historyInfoList.push({
    //           type: "其他",
    //           children: categorizedData.others
    //       });
    //   }

    //   // 更新数据
    //   console.log('historyInfoList', historyInfoList)
    //   this.historyInfoList = historyInfoList;

    //   // test
    //   this.groupUuid = data[0].groupUuid;
    //   this._getHistoryList()
    //   // test
    // },
    _getHistoryList(isGetLastId) {
      const _this = this;

      try {
        _this.axios.getHistoryList({
          "pageNum": 1,
          "pageSize": isGetLastId ? 1 : 1000,
          "param": {
              "groupUuid": _this.groupUuid,
          }
        }).then((res) => {
          console.log('getHistoryList:', res);
          const data = res.data.data;
          console.log('data', data);
          console.log('isGetLastId', isGetLastId);
          if (isGetLastId) {
            const lastChat = msgList[msgList.length - 1];
            if (lastChat && !lastChat.id) {
              lastChat.id = data.data[0].id;
              // msgList.splice(msgList.length - 1, 1, lastChat);
              msgList[msgList.length - 1] = lastChat;
              _this.setData({ msgList });
              console.log('msgList', msgList);
            }
            return;
          }
          msgList = [];
          if (data.data.length > 0) {
            // 定义倒序的data.data数组
            const reversedData = data.data.reverse();
            reversedData.forEach(item => {
              let files = item.files && item.files.length > 20 && JSON.parse(item.files)?  JSON.parse(item.files) : null;
              let isImage = false;
              console.log('files', files);
              if (files && files.length > 0) {
                const fileType = files[0].fileName.split('.').pop();
                console.log('fileType', fileType);
                isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType.toLowerCase());
                if (isImage) {
                  console.log('isImage', isImage);
                  // files = files.map((x) => FILE_BASE_URL + x.filePath);
                  files.forEach((x, i) => {
                    files[i].imgUrl = _this.baseUrl + x.filePath;
                  })
                } else {
                  files.forEach((x, i) => {
                    const sizeMB = Number((x.fileSize / 1024 / 1024).toFixed(2));
                    files[i].fileSizeMB = sizeMB + 'MB';
                    files[i].fileType = files[i].fileName.split('.').pop();
                    files[i].filePath = _this.baseUrl + x.filePath;
                  })
                }
              }

              console.log(' files last', files);
              
              msgList.push({
                  speaker: '',
                  contentType: 'text',
                  filesUrl: files || null,
                  isImage: isImage,
                  content: item.question
              });
              msgList.push({
                  speaker: 'server',
                  contentType: 'text',
                  id: item.id,
                  answerLike: item.answerLike,
                  comment: item.comment,
                  thinking: item.thinking,
                  content: item.answer
                  // nodes: app.towxml(item.answer, 'markdown')
              });
            });
          }
          console.log('msgList', msgList);
          this.msgList = msgList;
          this.welcomeShow = false;
          // _this.onClose();
          setTimeout(() => {
            _this.pageScrollToBottom()
          }, 100);
        })
      } catch (error) {
        
      }
    },

    renderMarkdown(text) {
      // 配置marked
      const renderer = new marked.Renderer();
      renderer.paragraph = (text) => {
        return text; // 直接返回文本内容，不包裹 p 标签
      };

      marked.setOptions({
        renderer: renderer,
        highlight: function (code, language) {
          const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
          return hljs.highlight(validLanguage, code).value;
        },
        pedantic: false,
        gfm: true,
        breaks: true,
        sanitize: false, // 设置为false以允许HTML标签s
        smartLists: true,
        smartypants: false,
        xhtml: false
      });

      // 渲染Markdown并返回HTML
      return marked(text);
    },

    _getRobotInfo() {
      const robotInfo = this.Util.getLocal('robotInfo');
      console.log('getRobotInfo', robotInfo);
      const actionList = [{name: '上传文件'}];
      if (robotInfo && robotInfo.id) {
        this.robotInfo = robotInfo;
        let llmsModels = robotInfo.llmsModels ? JSON.parse(robotInfo.llmsModels) : null;
        console.log('llmsModels', llmsModels);
        if (llmsModels?.vl?.modelName) {
          actionList.unshift({name: '上传图片'});
        }
        this.actionList = actionList;

        return;
      }
      this.axios.getDefaultBot().then(res => {
        console.log('getDefaultBot', res);
        this.robotInfo = res.data.data;
        let llmsModels = this.robotInfo.llmsModels ? JSON.parse(this.robotInfo.llmsModels) : null;
        console.log('llmsModels', llmsModels);
        if (llmsModels?.vl?.modelName) {
          actionList.unshift({name: '上传图片'});
        }
        this.actionList = actionList;
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
    // createGroup() {
    //   if (!this.ques) return;
    //   // 发送消息逻辑
    //   this.msgList.push({
    //     speaker: 'customer',
    //     contentType: 'text',
    //     filesUrl: this.imageList.length > 0 ? this.imageList : this.fileList,
    //     isImage: this.imageList.length > 0,
    //     content: this.ques,
    //   });
    //   this.ques = '';
    //   this.fileList = [];
    //   this.imageList = [];
    //   this.pageScrollToBottom();
    //   // TODO: 调用后端接口
    // },
    pageScrollToBottom() {
      console.log('pageScrollToBottom');
      this.$nextTick(() => {
        const el = this.$refs.chatContent?.$el || this.$refs.chatContent;
        console.log('elDOM元素:', el);
        console.log('el scrollHeight属性:', el?.scrollHeight);
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
::v-deep .el-dialog__body {
  padding-left: 50px;
  padding-right: 50px;
}
.upload-title {
  font-weight: bold;
  font-size: 16px;
  color: #000000;
  line-height: 22px;
}
.upload-desc {
  margin-top: 8px;
  font-weight: bold;
  font-size: 12px;
  color: #aaa;
  line-height: 17px;
  text-align: left;
}
.upload-area {
  margin-top: 35px;
  text-align: left;
}
.upload-btn {
  margin-top: 50px;
  margin-bottom: 46px;
}
.chat-home {
  height: 100%;
}
.bot-name {
  font-weight: 600;
  font-size: 20px;
  color: #000000;
  line-height: 29px;
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
  width: 704px;
  height: calc(100vh - 300px);
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0;
  margin: 0 auto;
  overflow-y: auto;
  background: #f6f6f7;
}
.input-box {
  margin-top: 10px;
  width: 100%;
}
.input-wrap {
  background-color: #F9FAFB;
}
.file-box {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.file-item {
  position: relative;
  display: flex;
  align-items: center;
  width: 200px;
  height: 55px;
  padding: 12px;
  box-sizing: border-box;
  margin-left: 14px;
  margin-top: 14px;
  background: #ffffff;
  border-radius: 6px;
}
.file-item .el-icon-error {
  position: absolute;
  right: 10px;
  top: 10px;
}
.file-icon {
  width: 30px;
  height: 30px;
  margin-right: 4px;
}
.file-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}
.file-name {
  width: 116px;
  font-size: 14px;
  font-weight: 600;
  overflow : hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
}
.file-size {
  font-size: 12px;
  color: #888;
}
.textarea-box {
  position: relative;
}
.textarea-box .textarea-icon {
  position: absolute;
  right: 18px;
  bottom: 16px;
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
}
.textarea-box .el-icon-circle-plus-outline {
  right: 48px;
}
.input-textarea ::v-deep .el-textarea__inner {
  width: calc(100% - 100px);
  margin-top: 20px;
  margin-left: 14px;
  margin-bottom: 14px;
  border: none;
  background-color: transparent;
}

.msg-box {
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
  margin-left: auto;
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
.msg-right .msg-content {
  background: #10A593;
   border-radius: 10px 10px 0 10px;
  color: #fff;
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
  position: fixed;
  bottom: 0;
  width: 704px;
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

::v-deep .page-body .page-main .right-panel .right-main.no-crumb {
  overflow-y: hidden;
}
</style>