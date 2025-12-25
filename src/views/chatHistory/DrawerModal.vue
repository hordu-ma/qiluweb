<template>

  <el-drawer size="630px"
    :visible.sync="localDrawerVisible"
    :with-header="false">
    <div class="drawerContent">

      <el-descriptions title="详情记录" :column="1">
        <el-descriptions-item label="姓名">{{drawerProps.name}}</el-descriptions-item>
        <el-descriptions-item label="账号">{{drawerProps.userName}}</el-descriptions-item>
        <el-descriptions-item label="智能体">{{drawerProps.botName}}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{drawerProps.createTime}}</el-descriptions-item>
        <el-descriptions-item label="提问内容">{{drawerProps.question}}</el-descriptions-item>
        <el-descriptions-item label="回答内容">
          <div v-html="renderMarkdown(drawerProps.answer)"></div>
         </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-drawer>
</template>

<script>
// import MarkdownIt from 'markdown-it';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

export default {
  name: 'DrawerModal',
  props:{
    drawerVisible:Boolean,
    drawerProps:{},
  },
  data(){
    return{
      localDrawerVisible: this.drawerVisible,
      markdown: '# Hello, Vue Markdown!',
    }
  },
  watch: {
    drawerVisible(newVal) {
      this.localDrawerVisible = newVal;
    },
    localDrawerVisible(newVal) {
      this.$emit('update:drawerVisible', newVal);
    }
  },
  methods: {
    renderMarkdown(text) {
      if (!text) return ''; // 如果文本为空，返回空字符串
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
  }
}
</script>



<style scoped lang="scss">
.drawerContent{
  padding: 30px;
}
</style>
