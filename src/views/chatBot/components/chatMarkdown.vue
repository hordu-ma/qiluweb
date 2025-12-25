<template>
  <div class="chat-container chat-container1">
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index"
        :class="['message-item', message.sender === 'me' ? 'my-message' : 'other-message']">
        <el-avatar v-if="message.sender !== 'me'"
          :src="helper1"
          size="small"></el-avatar>
        <el-avatar v-else src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          size="small"></el-avatar>
        <div class="message-content">
          <div class="message-sender" v-if="message.sender !== 'me'">
            {{ message.sender }}
          </div>
          <!-- 条件渲染加载图标 -->
           <div v-if="message.isLoading"><el-spinner :radius="40" /><span class="load-text">正在加载中...</span></div>
          <div  v-else class="message-text" v-html="renderMarkdown(message.text)"></div>
          <div class="message-time">
            {{ formatTime(message.time) }}
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <el-input :disabled="isLoading" type="textarea" :rows="3" placeholder="请输入内容" v-model="inputMessage"
        @keyup.enter.native="sendMessage"></el-input>
      <div class="input-actions">
        <el-button type="primary" size="small" @click="sendMessage" :disabled="!inputMessage.trim()">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import helper1 from '@/images/helper1.png'
import Util from "@/libs/util.js";
// import { EventSourcePolyfill } from "event-source-polyfill";
import {fetchEventSource} from '@microsoft/fetch-event-source';

export default {

  name: 'ChatDialog',
  props: {
    typeList: Array,
  },
  data() {
    return {
      helper1,
      isLoading: false,
      messages: [],
      inputMessage: '',
      loadingMessage: {}
    }
  },
  created() {
    this.messages =
      [
        {
          sender: '预警识别助手',
          text: '欢迎使用！我是预警识别助手，上传您的计划文件，我会快速识别其中潜在问题，为计划顺利推进保驾护航 。',
          time: new Date(),
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
        },
        // {
        //   sender: '预警识别助手',
        //   text: '**markdown格式的回答** *斜体文本*',
        //   time: new Date(),
        //   avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
        // }
      ]
  },
  mounted() {
    this.scrollToBottom()
  },
  updated() {
    this.scrollToBottom()
  },
  methods: {
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
    sendMessage() {
      const _this = this;
      if (!this.inputMessage.trim()) return
      if (!this.typeList.every(x => x.fileName)) {
        this.$message.warning('请先完成右侧所有文件的上传')
        return
      }
      this.isLoading = true;
      const newMessage = {
        sender: 'me',
        text: this.inputMessage,
        time: new Date()
      }
      this.loadingMessage = {
        sender: '预警识别助手',
        text: '',
        isLoading: true,
        time: new Date()
      };

      this.messages.push(newMessage)
      // this.inputMessage = ''
      this.messages.push(this.loadingMessage);
      this.sseMessage();
    },
    sseMessage() {
      let _this = this
      let count = 0;
      this.ctrl = new AbortController();
      let responseText = '';
      const requesInputMessage = this.inputMessage;
      this.inputMessage = '';
      fetchEventSource('/api/sse/getSseEmitter', {
          method: 'GET',
          headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Authorization': `Bearer ${Util.getSession('tmp_access_token')}`,
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
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            let newData = ev.data.trim();
            const parsedData = uuidRegex.test(newData) ? null : JSON.parse(newData);
            if (uuidRegex.test(newData)) {
              console.log('requesInputMessage:', requesInputMessage); 
              _this.axios.getStreamChat({
                question: requesInputMessage,
                sseEmitterId: newData,
              }).catch(err => {
                  _this.chartError()
              })
            } else if (parsedData?.finishReason === "stop") { // 接收到结束标记，结束SSE连接
              if (responseText === '') { // 如果没有接收到任何数据，则显示错误信息
                const loadingIndex = _this.messages.indexOf(_this.loadingMessage);
                responseText = parsedData.message;
                const lastMessage = {
                  sender: '预警识别助手',
                  text: responseText,
                  time: new Date(),
                }
                if (loadingIndex > -1) {
                  _this.messages.splice(loadingIndex, 1, lastMessage);
                } else { // 如果没有找到loadingMessage，则添加新消息
                  _this.messages.push(lastMessage);
                }
              }
              _this.ctrl.abort();
              _this.isLoading = false;
            } else if (parsedData && parsedData.message) {
              console.log('parsedData.message:', parsedData.message);
              if (responseText === '' ) { // 第一次接收到数据，清空loadingMessage
                responseText += parsedData.message;
                const loadingIndex = _this.messages.indexOf(_this.loadingMessage);
                const lastMessage = {
                  sender: '预警识别助手',
                  text: responseText,
                  time: new Date(),
                }
                if (loadingIndex > -1) {
                  _this.messages.splice(loadingIndex, 1, lastMessage);
                } else { // 如果没有找到loadingMessage，则添加新消息
                  _this.messages.push(lastMessage);
                }
              } else { // 后续接收到数据，更新loadingMessage的文本内容
                // let inserMessage = parsedData.message.replace('```markdown', '');
                // inserMessage = parsedData.message.replace('```', '');
                responseText += parsedData.message; 
                responseText = responseText.replace("```markdown", "");
                responseText = responseText.replace("```", "");
                _this.messages[_this.messages.length - 1].text = responseText;
              }
              console.log('responseText:', responseText);
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
    chartError() {
      const loadingIndex = this.messages.indexOf(this.loadingMessage);
        if (loadingIndex > -1) {
          this.messages.splice(loadingIndex, 1);
        }
        this.messages.push({
          sender: '预警识别助手',
          text: '请求出错，请稍后重试。',
          time: new Date(), 
        });
        this.loadingMessage = {};
        this.isLoading = false;
        this.ctrl.abort()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        container.scrollTop = container.scrollHeight
      })
    },
    formatTime(time) {
      const date = new Date(time)
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    },
  }
}
</script>

<style scoped lang="less">
.chat-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 60px) !important;
  border-radius: 4px;
  background-color: #ffffff;
  margin-top: 20px;
  border: 1px solid #3ea724;
  padding: 5px;
  .load-text {
    margin-left: 10px;
  }
}

.message-text {
  ::v-deep{
      pre {
        background-color: #f6f8fa;
        border-radius: 3px;
        padding: 16px;
        overflow: auto;
      }
      code {
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
        font-size: 85%;
        margin: 0;
        padding: 0.2em 0.4em;
      }
      blockquote {
      border-left: 4px solid #dfe2e5;
      color: #6a737d;
      padding: 0 1em;
      margin: 0 0 16px 0;
    }
    table {
      border-collapse: collapse;
      margin: 16px 0;
      width: 100%;
      border: 1px solid #dfe2e5; 
    }
    table th, table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    table tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
    }
    table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
  }
}

.my-message .message-text {
  ::v-deep * {
    color: #fff !important;
  }
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.message-item.my-message {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 75%;
  /* 增加消息内容的最大宽度 */
  margin: 0 10px;
}

.my-message .message-content {
  text-align: right;
}

.message-sender {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.message-text {
  padding: 10px 15px;
  /* 增加内边距 */
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.other-message .message-text {
  background-color: #fff;
  color: #303133;
  border: 1px solid #ebeef5;
}

.my-message .message-text {
  background-color: #409eff;
  color: #fff;
}



.message-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 5px;
}

.chat-input {
  border-top: 1px solid #ebeef5;
  padding: 10px;
  background-color: #f5f7fa;


  .input-actions {
    margin-top: 10px;
    text-align: right;
  }
}
</style>