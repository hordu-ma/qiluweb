<template>
  <div class="news-page" v-loading="loading" element-loading-text="加载中...">
    <div class="news-header">
      <div class="back" @click="$router.push({ name: 'newsList' })">
        返回列表
      </div>
    </div>

    <div v-if="!loading && !record" class="empty">
      <el-empty description="未找到内容" />
    </div>

    <div v-else-if="record" class="content">
      <div class="title">{{ record.title }}</div>
      <div class="meta">
        {{ formatDate(record.publish_at || record.created) }}
      </div>

      <div class="body">
        <div v-for="(block, idx) in blocks" :key="idx" class="block">
          <div v-if="block.type === 'text'" class="text" v-text="block.text" />
          <div v-else-if="block.type === 'image'" class="image">
            <img :src="block.url" :alt="block.alt || ''" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCenterNews, pbFileUrl } from "@/libs/pb";

export default {
  name: "NewsDetail",
  data() {
    return {
      loading: false,
      record: null,
    };
  },
  computed: {
    blocks() {
      if (!this.record || !this.record.body) return [];
      const images = Array.isArray(this.record.images)
        ? this.record.images
        : [];
      return this.parseBody(this.record.body, images);
    },
  },
  watch: {
    "$route.params.id": {
      immediate: true,
      handler() {
        this.load();
      },
    },
  },
  methods: {
    async load() {
      const id = this.$route.params.id;
      if (!id) return;

      this.loading = true;
      try {
        this.record = await getCenterNews(id);
      } catch (e) {
        this.record = null;
        this.$message && this.$message.error("获取详情失败");
      } finally {
        this.loading = false;
      }
    },
    parseBody(body, images) {
      const normalized = String(body).replace(/\r\n|\r/g, "\n");
      const regex = /\{\{img:\s*(\d+)\s*\}\}/g;

      const blocks = [];
      let lastIndex = 0;
      let match = null;

      while ((match = regex.exec(normalized)) !== null) {
        const before = normalized.slice(lastIndex, match.index);
        if (before.trim() !== "") {
          blocks.push({ type: "text", text: before.trimEnd() });
        }

        const n = Number(match[1]);
        const idx = Number.isFinite(n) ? n - 1 : -1;
        if (idx >= 0 && idx < images.length) {
          const filename = images[idx];
          blocks.push({
            type: "image",
            url: pbFileUrl("center_news", this.record.id, filename),
            alt: `图片${n}`,
          });
        }

        lastIndex = match.index + match[0].length;
      }

      const rest = normalized.slice(lastIndex);
      if (rest.trim() !== "") {
        blocks.push({ type: "text", text: rest.trim() });
      }

      return blocks;
    },
    formatDate(value) {
      if (!value) return "";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },
  },
};
</script>

<style scoped>
.news-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

.news-header {
  padding: 8px 0 16px;
}

.back {
  cursor: pointer;
  color: #2e7d7b;
}

.content {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 18px 18px 10px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2d3d;
  margin-bottom: 6px;
}

.meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 14px;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #303133;
  font-size: 14px;
}

.image img {
  max-width: 100%;
  border-radius: 8px;
  display: block;
}

.empty {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 24px;
}
</style>
