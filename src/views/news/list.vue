<template>
  <div class="news-page">
    <div class="news-header">
      <div class="title">中心动态</div>
      <div class="back" @click="$router.push({ path: '/welcome' })">
        返回首页
      </div>
    </div>

    <div v-loading="loading" element-loading-text="加载中...">
      <div v-if="!loading && items.length === 0" class="empty">
        <el-empty description="暂无动态" />
      </div>

      <div v-else class="list">
        <div
          v-for="item in items"
          :key="item.id"
          class="list-item"
          @click="goDetail(item.id)"
        >
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">
            {{ formatDate(item.publish_at || item.created) }}
          </div>
          <div v-if="item.summary" class="item-summary">{{ item.summary }}</div>
        </div>
      </div>

      <pagination
        class="pagination"
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script>
import Pagination from "@/components/Pagination/index.vue";
import { listCenterNews } from "@/libs/pb";

export default {
  name: "NewsList",
  components: {
    Pagination,
  },
  data() {
    return {
      loading: false,
      items: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    async getList() {
      this.loading = true;
      try {
        const data = await listCenterNews({
          page: this.queryParams.pageNum,
          perPage: this.queryParams.pageSize,
        });
        this.items = Array.isArray(data.items) ? data.items : [];
        this.total = Number.isFinite(data.totalItems) ? data.totalItems : 0;
      } catch (e) {
        this.items = [];
        this.total = 0;
        this.$message && this.$message.error("获取中心动态失败");
      } finally {
        this.loading = false;
      }
    },
    goDetail(id) {
      this.$router.push({ name: "newsDetail", params: { id } });
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;
}

.title {
  font-size: 22px;
  font-weight: 700;
}

.back {
  cursor: pointer;
  color: #2e7d7b;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  cursor: pointer;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px 16px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 6px;
}

.item-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.item-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.pagination {
  margin-top: 16px;
}

.empty {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 24px;
}
</style>
