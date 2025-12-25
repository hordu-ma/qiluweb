<template>
  <div class = "addarea">
      <div>
        <Form ref="chatBotForm" :model="form"  :label-width="110">
          <FormItem label="类型" required  v-show="true">
            <Select v-model="form.useType" onchange="typeChage()">
              <Option v-for="(item,index) in useTypeData" :key="item.val" :value="item.val" >{{item.name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="名称" required >
            <Input v-model="form.name" placeholder="请输入名称" clearable/>
          </FormItem>

          <FormItem label="欢迎语" required v-show="form.useType===1?false:true">
            <Input v-model="form.welcomeTip" type="textarea" placeholder="请输入欢迎语" clearable/>
          </FormItem>


          <FormItem label="提词信息" required>
            <Input v-model="form.prompt" rows = 15 type="textarea" placeholder="我想让你做一个{context}我会把我的位置写给你，你会推荐一个靠近我的位置的地方。在某些情况下，我还会告诉您我将访问的地方类型。您还会向我推荐靠近我的第一个位置的类似类型的地方。我的第一个建议请求是{question}" clearable/>
          </FormItem>

          <FormItem label="知识库" required  v-show="form.useType===1?false:true">
            <Select v-model="form.namespaceId"  >
              <Option v-for="(item,index) in namespaceData" :key="item.id" :value="item.id" >{{item.name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="长程记忆"   v-show="form.useType===1?false:true">
            <InputNumber v-model="form.memoryLimitSize"  placeholder="长程记忆(条) " number/>
          </FormItem>
          <FormItem label="来源域名"  v-show="form.useType===1?false:true" >
            <Input v-model="form.originDomain"  placeholder="来源域名" clearable/>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="cancelForm('chatBotForm')">取消</Button>
        <Button size="large" @click="submitForm('chatBotForm')" v-if="TreeText!='详情'">确认</Button>
      </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      formShowFlag:true,
      TreeText:'新增',
      form:{name:'',useType:1,prompt: ''},
      useTypeData:[{"name":"公域(Prompt)",val:1},{"name":"私域(本地知识)",val:0}],
      namespaceData:[{"name":"AAAA知识库",id:"AAAAA"},{"name":"BBBBB知识库",id:"BBBB"}],
    }
  },
  mounted() {
    this.allNamespace();
  },
  methods:{
    typeChange(){
      if (this.form.prompt = ''){
        this.form.prompt ='使用以下上下文来回答最后的问题。如果你不知道答案，就说你不知道，不要试图编造答案。\n' +
            '\n' +
            '{context}\n' +
            '\n' +
            '{chat_history}\n' +
            '\n' +
            '问题: {question}\n' +
            '请按照以下格式回答问题，如:\n' +
            'answer:\n' +
            '1.\n' +
            '2.\n' +
            '3.\n' +
            '回答:';
        console.log(this.form.prompt);
      }else {
        this.form.prompt = '';
        console.log(this.form.prompt);
      }
    },
    validataForm() {
      var _result = true;
      if (this.form.name.length == 0) {
        this.showViewMessage('请输入工作空间名称');
        _result = false;
        return;
      }
      return _result;
    },
    fromVisibelChange(){
      console.log("fromVisibelChange")
    },
    submitForm(name){//新增確認
      if (this.validataForm())  {
        let param =this.form;
        let that = this;
        if(this.TreeText == '新增'){
          this.axios.save(param).then(function (data) {
            console.log("返回",data)
            if (data.data.code == '0') {
              that.formShowFlag=false;
              // window.location.reload()
              that.list();
            } else {
              that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
            }
          }).catch(function (error) {
            console.log("error: ", error);
            that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
          });
        }else{
          this.axios.update(param).then(function (data) {
            if (data.data.code == '0') {
              // window.location.reload();
              that.formShowFlag=false;
              that.list();
            }
          }).catch(function (error) {
            console.log("error: ", error);
            that.$Modal.error({ 'title': '提示', 'content': '操作失败' });
          });
        }

      }
    },
    cancelForm(name){//取消
      this.formShowFlag=false;
    },
    add() {
      this.$refs['chatBotForm'].resetFields();
      this.TreeText = '新增';
      this.form={};
      this.form.name = '';
      this.form.useType=0;
      this.form.prompt='使用以下上下文来回答最后的问题。如果你不知道答案，就说你不知道，不要试图编造答案。\n' +
          '\n' +
          '{context}\n' +
          '\n' +
          '{chat_history}\n' +
          '\n' +
          '问题: {question}\n' +
          '请按照以下格式回答问题，如:\n' +
          'answer:\n' +
          '1.\n' +
          '2.\n' +
          '3.\n' +
          '回答:';
      this.formShowFlag=true;
    },
    allNamespace(){
      let param ={};
      let _this = this;
      this.axios.allNamespace(param).then(data => {
        if (data.data.code == '0') {
          _this.namespaceData = data.data.data;
        } else {
          this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
        }
      }).catch(error => {
        console.log("error: ", error)
        this.$Modal.error({'title': '获取失败', 'content': '获取失败'});
      });
    },
  }
}
</script>
<style lang="less">
.addarea{
  padding-top: 100px;
  padding-left: 100px;
  padding-right: 100px

}
</style>