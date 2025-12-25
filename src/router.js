const routers = [
  {
    path: "/",
    name: "home",
    redirect: "/welcome",
    meta: {
      title: "主页",
    },
    // 补全文件后缀
    component: () => import("./views/index.vue"),
  },
  {
    path: "/login",
    name: "login",
    meta: {
      title: "登录",
    },
    // 补全文件后缀
    component: () => import("./views/login.vue"),
  },
  {
    path: "/reset",
    name: "reset",
    meta: {
      title: "重置密码",
    },
    component: () => import("./views/reset.vue"),
  },
  {
    path: "/welcome",
    name: "welcome",
    meta: {
      title: "首页",
    },
    component: () => import("./views/welcome.vue"),
  },
  {
    path: "/center-intro",
    name: "centerIntro",
    meta: {
      title: "中心简介",
    },
    component: () => import("./views/centerIntro.vue"),
  },
  {
    path: "/contact",
    name: "contact",
    meta: {
      title: "联系我们",
    },
    component: () => import("./views/contact.vue"),
  },
  {
    path: "/platforms",
    name: "platforms",
    meta: {
      title: "二级平台",
    },
    component: () => import("./views/platforms.vue"),
  },
  {
    path: "/index",
    name: "index",
    redirect: "main",
    meta: {
      title: "首页",
    },
    // 补全文件后缀
    component: () => import("./views/index.vue"),
    children: [
      {
        path: "/main",
        name: "main",
        meta: {
          title: "首页",
          isHide: true,
        },
        // 补全文件后缀
        component: () => import("./views/system/index/index.vue"),
      },
      {
        path: "/me",
        name: "me",
        meta: {
          title: "个人中心",
          isHide: true,
        },
        // 补全文件后缀
        component: () => import("./views/system/me.vue"),
      },
      {
        path: "/myReset",
        name: "myReset",
        meta: {
          title: "个人中心",
          isHide: true,
        },
        // 补全文件后缀
        component: () => import("./views/reset.vue"),
      },
      {
        path: "/systemBot",
        name: "systemBot",
        meta: {
          title: "智能体",
        },
        component: () => import("./views/chatBot/index.vue"),
      },
      {
        path: "/accountList",
        name: "accountList",
        meta: {
          title: "账号管理",
        },
        component: () => import("./views/system/index/index.vue"),
      },
      {
        path: "/histroyList",
        name: "histroyList",
        meta: {
          title: "历史记录",
        },
        component: () => import("./views/chatHistory/index.vue"),
      },
      {
        path: "/chatStart",
        name: "chatStart",
        meta: {
          title: "宁波针织",
        },
        // 已补全文件后缀
        component: () => import("./views/chatBot/start.vue"),
      },
      {
        path: "/chatBot",
        name: "chatBot",
        meta: {
          title: "聊天机器人",
        },
        // 补全文件后缀
        component: () => import("./views/chatBot/list.vue"),
      },
      {
        path: "/agentBot",
        name: "agentBot",
        meta: {
          title: "代理机器人",
        },
        // 补全文件后缀
        component: () => import("./views/agentBot/list.vue"),
      },
      {
        path: "/namespaceIndex",
        name: "namespaceIndex",
        meta: {
          title: "知识库概览",
        },
        // 补全文件后缀
        component: () => import("./views/namespace/wait.vue"),
      },
      {
        path: "/namespaceList",
        name: "namespaceList",
        meta: {
          title: "知识库",
        },
        // 补全文件后缀
        component: () => import("./views/namespace/list.vue"),
      },
      {
        path: "/namespaceFile",
        name: "namespaceFile",
        meta: {
          title: "知识库文件",
        },
        // 补全文件后缀
        component: () => import("./views/namespace/file.vue"),
      },
      {
        path: "/namespaceExcel",
        name: "namespaceExcel",
        meta: {
          title: "关联文件",
        },
        // 补全文件后缀
        component: () => import("./views/namespace/index.vue"),
      },
      {
        path: "/chatHistory",
        name: "chatHistory",
        meta: {
          title: "聊天历史详情",
        },
        // 补全文件后缀
        component: () => import("./views/chatHistory/list.vue"),
      },
      {
        path: "/chatHistoryCount",
        name: "chatHistoryCount",
        meta: {
          title: "聊天历史记录",
        },
        // 补全文件后缀
        component: () => import("./views/chatHistoryCount/list.vue"),
      },
      {
        path: "/addBot",
        name: "addBot",
        meta: {
          title: "新增机器人",
        },
        // 补全文件后缀
        component: () => import("./views/chatBot/add.vue"),
      },
      {
        path: "/system",
        name: "system",
        meta: {
          title: "系统配置",
        },
        // 补全文件后缀
        component: () => import("./views/system/list.vue"),
      },
      {
        path: "/greenNet",
        name: "greenNet",
        meta: {
          title: "禁用语配置",
        },
        // 补全文件后缀
        component: () => import("./views/prohibited/list.vue"),
      },
      {
        path: "/greenNetHistory",
        name: "greenNetHistory",
        meta: {
          title: "禁用语配置",
        },
        // 补全文件后缀
        component: () => import("./views/prohibited/history.vue"),
      },
    ],
  },
];

export default routers;
