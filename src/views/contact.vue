<template>
  <div class="contact-page">
    <section class="contact-hero">
      <h1>联系我们</h1>
      <p>
        运营团队 24/7
        在线，欢迎通过电话、邮件或到访体验中心，获取诊疗教学平台的最新动态与合作机会。
      </p>
    </section>
    <section class="contact-grid">
      <article>
        <span>电话</span>
        <strong>+86 0531 1234 5678</strong>
        <p>周一至周日 08:30 - 20:30</p>
      </article>
      <article>
        <span>邮箱</span>
        <strong>service@qilu.med</strong>
        <p>邮件回复通常在 4 小时内</p>
      </article>
      <article>
        <span>地址</span>
        <strong>山东省济南市经十路 12388 号</strong>
        <p>齐鲁医学科技创新中心 B 座</p>
      </article>
    </section>
    <section class="contact-note">
      <p>欢迎预约参观，或通过平台内的“AI 助手”获取一对一支持。</p>
    </section>
  </div>
</template>

<script>
export default {
  name: "ContactPage",
};
</script>

<style lang="less" scoped>
.contact-page {
  min-height: 100vh;
  background: #fefefe;
  padding: 64px 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: #0b3048;
}
.contact-hero {
  background: #0a3f63;
  color: #fff;
  padding: 42px;
  border-radius: 22px;
  h1 {
    margin-bottom: 12px;
    font-size: 36px;
  }
  p {
    font-size: 16px;
    line-height: 1.8;
  }
}
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  article {
    background: #fff;
    padding: 28px;
    border-radius: 16px;
    border: 1px solid #e0e6f0;
    box-shadow: 0 10px 30px rgba(10, 63, 99, 0.08);
    span {
      font-size: 12px;
      color: #999;
      letter-spacing: 0.3em;
      text-transform: uppercase;
    }
    strong {
      display: block;
      margin: 10px 0;
      font-size: 20px;
      color: #0a3f63;
    }
    p {
      color: #4a5b70;
      line-height: 1.6;
    }
  }
}
.contact-note {
  background: #ecf9fb;
  padding: 24px 32px;
  border-radius: 14px;
  border-left: 4px solid #10a593;
  font-size: 16px;
  color: #0a3f63;
}
</style>
