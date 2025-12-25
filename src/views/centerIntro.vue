<template>
  <div class="center-intro-page">
    <section class="hero-panel">
      <div>
        <p class="eyebrow">齐鲁医学交叉创新平台</p>
        <h1>中心简介</h1>
        <p class="lead">
          以“智慧医疗+沉浸式教学”双核理念为驱动，集成了混合现实、三维打印与可视化诊疗三个能力域，
          为基础医学与临床融合实验提供统一的可视化体验与教育治理体系。
        </p>
      </div>
      <div class="hero-meta">
        <p>区域合作院校：山东大学齐鲁医院等</p>
        <p>支撑场景：虚拟解剖教室、临床仿真操作、科技成果转化</p>
      </div>
    </section>
    <section class="highlights">
      <article>
        <h3>学术共建</h3>
        <p>
          跨学科课题与实训模板输出，支持教师与学生在同一平台协同构建教学内容。
        </p>
      </article>
      <article>
        <h3>临床赋能</h3>
        <p>
          通过三维建模与可视化分析，提前模拟复杂手术与流程，实现安全的技能迁移。
        </p>
      </article>
      <article>
        <h3>科技传播</h3>
        <p>开放 API 与知识图谱接口，推动产学研用协同，加速医学创研成果落地。</p>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: "CenterIntro",
};
</script>

<style lang="less" scoped>
.center-intro-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6fbff 0%, #ffffff 35%, #f3f8fb 100%);
  padding: 64px 80px;
  display: flex;
  flex-direction: column;
  gap: 48px;
  color: #0b3048;
}
.hero-panel {
  background: #0a3f63;
  color: #fff;
  padding: 40px;
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    margin-bottom: 12px;
  }
  h1 {
    font-size: 36px;
    margin-bottom: 16px;
  }
  .lead {
    font-size: 16px;
    line-height: 1.6;
    max-width: 640px;
  }
  .hero-meta {
    background: rgba(255, 255, 255, 0.08);
    padding: 24px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.8;
    text-align: right;
  }
}
.highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  article {
    background: #fff;
    padding: 28px;
    border-radius: 18px;
    box-shadow: 0 12px 30px rgba(10, 63, 99, 0.08);
    h3 {
      margin-bottom: 8px;
      color: #0a3f63;
    }
    p {
      color: #4a5b70;
      line-height: 1.7;
    }
  }
}
</style>
