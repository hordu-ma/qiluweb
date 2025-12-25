// 申明插件
import Vue from "vue";
import VueRouter from "vue-router";
import ViewUI from "view-design";
import Routers from "./router";
import Util from "./libs/util";
import App from "./app.vue";
import "view-design/dist/styles/iview.css";
import axios from "./libs/axios/index";
import projectType from "./libs/projectType.js";

import "vue-flow-editor/docs/lib/g6.umd.min";
import VueCompositionAPI from "@vue/composition-api";
import VueFlowEditor from "vue-flow-editor";
import "vue-flow-editor/docs/dist/vue-flow-editor.css";
import { ref, reactive } from "@vue/composition-api";
import ElementUI from "element-ui";
// import 'element-ui/lib/theme-chalk/index.css';
import "./element-variables.scss";
Vue.use(ElementUI);

import "./static/iconfont.css";

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

// 安装插件
Vue.use(VueRouter);
Vue.use(ViewUI);

Vue.use(VueCompositionAPI);
Vue.use(VueFlowEditor);

// 路由配置
const RouterConfig = {
  mode: "history",
  base: import.meta.env.MODE === "production" ? "/" : "/",
  routes: Routers,
};

export function useRouter() {
  return router;
}

export function useRoute() {
  return router.currentRoute;
}

const router = new VueRouter(RouterConfig);
const showLoad = (text = "Loading") => {
  ViewUI.Spin.show({
    render: (h) => {
      return h("div", [
        h("Icon", {
          class: "spin-icon-load",
          props: {
            type: "ios-loading",
            size: 30,
          },
        }),
        h("div", text),
      ]);
    },
  });
};

const hideLoad = () => {
  ViewUI.Spin.hide();
};

router.beforeEach((to, from, next) => {
  // 正常登录页，不拦截
  if (to.name === "login" || to.name === "reset" || to.name === "welcome") {
    ViewUI.LoadingBar.start();
    Util.title(to.meta.title);
    next();
  } else {
    next("/welcome");
  }
});

router.afterEach((to, from, next) => {
  ViewUI.LoadingBar.finish();
  window.scrollTo(0, 0);
});
Vue.prototype.axios = axios;
Vue.prototype.Util = Util;
Vue.prototype.showViewMessage = (content, type = "error", duration = 2) => {
  console.log(ViewUI);
  ViewUI.Message[type]({
    background: true,
    duration: duration,
    content: content,
  });
};
Vue.prototype.getProductType = (callback) => {
  showLoad();
  let _param = {};
  axios
    .queryProductType(_param)
    .then((data) => {
      let _arr = [];
      hideLoad();
      if (data.errcode === "0" && data.result) {
        var _resultList = Object.keys(data.result);
        _resultList.forEach((key) => {
          _arr.push({
            id: key,
            value: data.result[key],
          });
        });
      } else {
        _arr = projectType.productType;
      }
      callback && callback(_arr);
    })
    .catch((error) => {
      hideLoad();
      callback && callback(projectType.productType);
    });
};
Vue.prototype.getFileNum = (callback) => {
  showLoad();
  let _param = {};
  axios
    .getFileNum(_param)
    .then((data) => {
      let _length = 5;
      hideLoad();
      if (data.errcode === "0" && data.result) {
        _length = data.result.fileNum;
      }
      callback && callback(_length);
    })
    .catch((error) => {
      hideLoad();
      callback && callback(5);
    });
};
Vue.prototype.showLoading = showLoad;
Vue.prototype.hideLoading = hideLoad;
Vue.prototype.baseUrl = "http://47.236.254.2";
Vue.prototype.operatorId = "";
Vue.prototype.setOperatorId = (operatorId) => {
  Vue.prototype.operatorId = operatorId;
};

// 调整挂载应用的方式
const app = new Vue({
  router: router,
  render: (h) => h(App),
});

app.$mount("#app");

/**
 * 时间戳转换日期
 * @param <int> unixTime    待时间戳(秒)
 * @param <bool> type    返回完整时间('yyyy-MM-dd hh:mm:ss' 或者 'yyyy-MM-dd' )
 */
Vue.filter("time", function (value, type = "yyyy-MM-dd hh:mm:ss") {
  if (!value) {
    return "";
  }
  let _value = value
    .replace(/-/g, "/")
    .replace("T", " ")
    .replace(/[.]\d*[+]\d*/g, "");
  var newDate = new Date(_value || new Date());
  Date.prototype.format = function (format) {
    var date = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S+": this.getMilliseconds(),
    };
    if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length)
        );
      }
    }
    return format;
  };
  return newDate.format(type);
});

/**
 * 订单状态转换
 * @param <string> value    状态码
 */
Vue.filter("state", function (value) {
  let _status = "";
  switch (value) {
    case "unCheck":
      _status = "待验收";
      break;
    case "unAudit":
      _status = "待审核";
      break;
    case "unGathering":
      _status = "待收款";
      break;
    case "success":
      _status = "已完成";
      break;
    case "cancel":
      _status = "已取消";
      break;
    case "unReceiving":
      _status = "待接收";
      break;
    case "reject":
      _status = "已拒绝";
      break;
    case "unCallback":
      _status = "待回单";
      break;
    default:
      _status = "创建订单";
      break;
  }
  return _status;
});
