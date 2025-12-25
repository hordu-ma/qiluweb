<template>
  <div class="platforms-page">
    <header>
      <p class="eyebrow">二级平台</p>
      <h1>内置模块一览</h1>
      <p class="subtitle">
        悬浮导航的快捷入口，可跳转至对应场景进一步了解技术现状与教学价值。
      </p>
    </header>
    <section class="platform-grid">
      <article
        v-for="platform in platformList"
        :key="platform.id"
        :class="{ active: platform.id === activePlatformId }"
      >
        <div class="platform-tag">{{ platform.tag }}</div>
        <h3>{{ platform.title }}</h3>
        <p>{{ platform.description }}</p>
        <button v-if="platform.id === activePlatformId" class="primary-btn">
          当前查看
        </button>
      </article>
    </section>
    <section class="platform-detail" v-if="activePlatform">
      <h2>焦点：{{ activePlatform.title }}</h2>
      <p>{{ activePlatform.body }}</p>
      <p class="meta">查阅参数：module={{ activePlatform.id }}</p>
    </section>
  </div>
</template>

<script>
export default {
  name: "PlatformsPage",
  computed: {
    platformList() {
      return [
        {
          id: "medxr",
          title: "齐鲁混合现实医学教学平台",
          description: "沉浸式仿真、轻量化协作、场景复用能力",
          body: "融合多模数据与 AI 助力的仿真策略，为师生提供可复用的任务流、评估仪表盘和操作洞察。",
          tag: "MR 教学",
        },
        {
          id: "printing",
          title: "齐鲁医学教学3D打印中心",
          description: "快速生成高精度解剖模型与结构化知识卡",
          body: "以临床训练需求为导向，为精准手术规划及签约教学提供高复现度模型与数字孪生。",
          tag: "3D 打印",
        },
        {
          id: "lingjing",
          title: "灵境医览",
          description: "智慧协同的医用可视化数据展现平台",
          body: "把握临床信息、术中导航与智能分析，构建真实感可视化决策墙。",
          tag: "临床可视化",
        },
        {
          id: "mediqube",
          title: "医知立方 MediQube",
          description: "多模知识融合与语义检索的中台能力",
          body: "通过语义关联与推荐引擎，将知识点、经验和模型拼接成跨院区的教学闭环。",
          tag: "知识中台",
        },
      ];
    },
    activePlatformId() {
      return this.$route.query.module || "medxr";
    },
    activePlatform() {
      return this.platformList.find(
        (item) => item.id === this.activePlatformId
      );
    },
  },
};
</script>

<style lang="less" scoped>
.platforms-page {
  min-height: 100vh;
  background: #f3f8fb;
  padding: 64px 80px;
  color: #0b3048;
  display: flex;
  flex-direction: column;
  gap: 40px;
  header {
    h1 {
      font-size: 38px;
      margin-bottom: 8px;
    }
    .eyebrow {
      letter-spacing: 0.4em;
      text-transform: uppercase;
      font-size: 12px;
      color: #10a593;
    }
    .subtitle {
      margin-top: 8px;
      color: #4f5b72;
      max-width: 640px;
      line-height: 1.8;
    }
  }
}
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}
.platform-grid article {
  background: #ffffff;
  border-radius: 20px;
  padding: 22px;
  min-height: 180px;
  border: 1px solid transparent;
  box-shadow: 0 12px 28px rgba(10, 63, 99, 0.08);
  transition: transform 0.2s ease, border 0.2s ease;
  h3 {
    margin: 10px 0;
    color: #0a3f63;
  }
  p {
    color: #4f5b72;
  }
  .platform-tag {
    font-size: 12px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #10a593;
  }
  button {
    margin-top: 14px;
    border: none;
    background: #10a593;
    color: #fff;
    padding: 8px 18px;
    border-radius: 12px;
    cursor: pointer;
  }
}
.platform-grid article.active {
  transform: translateY(-4px);
  border-color: rgba(16, 165, 147, 0.5);
}
.platform-detail {
  background: #fff;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(8, 35, 62, 0.1);
  h2 {
    color: #0a3f63;
    margin-bottom: 12px;
  }
  .meta {
    margin-top: 12px;
    color: #9aa5b8;
    font-size: 14px;
  }
}
</style>
