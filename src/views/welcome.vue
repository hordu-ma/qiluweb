<template>
  <div class="welcome-box">
    <div class="welcome-header">
      <div class="welcome-logo">
        <img
          src="../images/shanda2.cc0b2c4e.png"
          alt="Shanda"
          class="logo-shanda"
        />
        <div class="logo-line"></div>
        <img
          src="../images/shanda_logo.png"
          alt="Shanda_logo"
          class="logo-shanda"
        />
      </div>
      <nav class="welcome-nav">
        <span class="nav-link" @click="goHome">首页</span>
        <span class="nav-link" @click="goIntro">中心简介</span>
        <div
          class="nav-item nav-dropdown"
          @mouseenter="showDropdown = true"
          @mouseleave="showDropdown = false"
        >
          <span class="nav-link">二级平台</span>
          <transition name="fade">
            <div v-if="showDropdown" class="dropdown-menu">
              <div
                v-for="platform in secondaryPlatforms"
                :key="platform.id"
                class="dropdown-item"
                @click="navigateToPlatform(platform)"
              >
                <div class="dropdown-title">{{ platform.title }}</div>
                <div class="dropdown-desc">{{ platform.description }}</div>
              </div>
            </div>
          </transition>
        </div>
        <span class="nav-link" @click="goContact">联系我们</span>
      </nav>
    </div>
    <div class="welcome-carousel-section">
      <div class="welcome-carousel">
        <el-carousel :interval="4000" height="510px">
          <el-carousel-item
            v-for="(image, index) in carouselImages"
            :key="index"
          >
            <img :src="image.url" :alt="image.title" class="carousel-image" />
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="center-news">
        <div class="news-header">
          <h2>中心动态</h2>
          <span class="more-link">更多 ></span>
        </div>
        <div class="news-list">
          <div v-for="news in centerNews" :key="news.id" class="news-item">
            <div class="news-date">
              <div class="date-day">{{ news.day }}</div>
              <div class="date-month">{{ news.month }}</div>
            </div>
            <div class="news-content">
              <div class="news-title">{{ news.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content" v-loading="isLoading" element-loading-text="加载中...">
      <div
        class="itemInfo"
        v-for="item in appList"
        :key="item.id"
        @click="handleItemClick(item)"
      >
        <div class="item-image">
          <img
            :src="fullImageUrl(item.avatar)"
            :class="item.name ? 'info-img' : 'info-img-single'"
            alt=""
          />
        </div>
        <div class="topBox" v-if="item.name">
          <span class="name">{{ item.name }}</span>
          <div class="desc">{{ item.introduction }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入图片资源
import Bg1 from "../images/bgimage1.jpg";
import Bg2 from "../images/bgimage2.jpg";
import Bg3 from "../images/bgimage3.jpg";

export default {
  data() {
    return {
      showDropdown: false,
      secondaryPlatforms: [
        {
          id: "medxr",
          title: "齐鲁混合现实医学教学平台",
          description: "沉浸式教学空间与场景驱动训练",
        },
        {
          id: "printing",
          title: "齐鲁医学教学3D打印中心",
          description: "一站式模型输出与解剖演练",
        },
        {
          id: "lingjing",
          title: "灵境医览",
          description: "智源驱动的临床可视化导航",
        },
        {
          id: "mediqube",
          title: "医知立方 MediQube",
          description: "知识融合与多模块协同平台",
        },
      ],
      centerNews: [
        {
          id: 1,
          day: "26",
          month: "12/25",
          title: "齐鲁医学混合现实教学平台正式启用，开启沉浸式医学教育新篇章",
        },
        {
          id: 2,
          day: "20",
          month: "12/25",
          title: "3D打印中心完成首批精准解剖模型交付，助力外科手术规划",
        },
        {
          id: 3,
          day: "15",
          month: "12/25",
          title: "灵境医览平台上线智能导航功能，提升临床诊疗可视化体验",
        },
        {
          id: 4,
          day: "10",
          month: "12/25",
          title: "医知立方MediQube知识中台与多家医院达成数据共享协议",
        },
      ],
      appList: [],
      carouselImages: [
        {
          url: Bg1,
          title: "img1",
        },
        {
          url: Bg2,
          title: "img2",
        },
        {
          url: Bg3,
          title: "img3",
        },
      ],
      pageNum: 1,
      pageSize: 10,
      isLoading: false,
      hasMore: true,
    };
  },
  mounted() {
    this.getAppList();
    this.$nextTick(() => {
      window.addEventListener("scroll", this.handleScroll, { passive: true });
    });
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  computed: {
    fullImageUrl() {
      const baseUrl =
        import.meta.env.VITE_IMAGE_BASE_URL || "http://47.236.254.2";
      return (avatar) => `${baseUrl}${avatar}`;
    },
  },
  methods: {
    goHome() {
      if (this.$route.path !== "/welcome") {
        this.$router.push({ path: "/welcome" });
      }
    },
    goIntro() {
      this.$router.push({ path: "/center-intro" });
    },
    goContact() {
      this.$router.push({ path: "/contact" });
    },
    navigateToPlatform(platform) {
      this.showDropdown = false;
      this.$router.push({
        path: "/platforms",
        query: { module: platform.id },
      });
    },
    getAppList(isLoadMore = false) {
      if (this.isLoading || !this.hasMore) return;

      this.isLoading = true;

      const params = {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        param: {
          clientType: 1,
        },
      };

      this.axios
        .getAppList(params)
        .then((res) => {
          if (res.data.data) {
            const { data, total } = res.data.data;
            if (isLoadMore) {
              this.appList = [...this.appList, ...data];
            } else {
              this.appList = data;
            }

            // 使用总数据量判断是否还有更多数据
            const currentPageTotal = this.pageNum * this.pageSize;
            if (currentPageTotal >= total) {
              this.hasMore = false;
            } else {
              this.pageNum++;
            }
          }
        })
        .catch((error) => {
          this.$message.error("获取应用列表失败");
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    handleScroll() {
      if (this.isLoading || !this.hasMore) return;

      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 0;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );

      if (scrollTop + viewportHeight >= docHeight - 120) {
        this.getAppList(true);
      }
    },
    async handleItemClick(item) {
      // 构建redirectUri
      const redirectUri = item.redirectUri;
      const appName = item.name || "应用";

      // 检查是否有session token
      if (!this.Util.getSession("tmp_access_token")) {
        // 没有token，跳转到登录页面，携带参数
        this.$router.push({
          path: "/login",
          query: {
            redirectUri: redirectUri,
            appName: appName,
          },
        });
      } else {
        // 有token，获取code
        const authRes = await this.axios.getAuthCode();
        const token = authRes.data.data;
        const url = new URL(redirectUri);
        url.searchParams.set("token", token || "");
        window.location.href = url.toString();
      }
    },
  },
  watch: {
    $route() {
      this.showDropdown = false;
    },
  },
};
</script>

<style lang="less" scoped>
.welcome-box {
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}
.welcome-header {
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  height: 60px;
  padding: 0 72px;
  box-shadow: 2px 2px 41px #0a7568;
  background-color: #10a593;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .welcome-logo {
    display: flex;
    align-items: center;
    height: 60px;
    gap: 12px;
    .logo-shanda {
      width: 207px;
      height: 50px;
    }
    .logo-line {
      width: 1px;
      height: 20px;
      background-color: #fff;
    }
  }
  .welcome-nav {
    display: flex;
    align-items: center;
    gap: 32px;
    color: #fff;
    font-size: 16px;
    letter-spacing: 0.02em;
  }
  .nav-link {
    cursor: pointer;
    position: relative;
    color: inherit;
    font-weight: 500;
    padding-bottom: 4px;
    display: inline-flex;
    align-items: center;
    height: 100%;
    padding-top: 2px;
  }
  .nav-link::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: #fff;
    top: 0;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.2s ease;
    border-radius: 999px;
  }
  .nav-link:hover::after {
    transform: scaleX(1);
  }
  .nav-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .dropdown-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    width: 320px;
    background: #fff;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(16, 165, 147, 0.25);
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 99;
  }
  .dropdown-item {
    padding: 10px 14px;
    border-radius: 12px;
    background: #f7fcff;
    border: 1px solid rgba(16, 165, 147, 0.2);
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .dropdown-item:hover {
    transform: translateY(-2px);
    background: #ecf9fb;
  }
  .dropdown-title {
    font-weight: 600;
    color: #0a3f63;
    margin-bottom: 4px;
  }
  .dropdown-desc {
    font-size: 12px;
    color: #4f5b72;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.welcome-carousel-section {
  width: 100%;
  height: 510px;
  display: flex;
  gap: 0;
}
.welcome-carousel {
  flex: 2;
  height: 510px;

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // 轮播图指示器样式 - 圆形
  ::v-deep .el-carousel__indicators {
    .el-carousel__indicator {
      .el-carousel__button {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        border: none;
        transition: all 0.3s ease;
      }

      &.is-active .el-carousel__button {
        background-color: #fff;
        width: 12px;
        height: 12px;
      }
    }
  }

  // 水平居中指示器
  ::v-deep .el-carousel__indicators--horizontal {
    bottom: 30px;
  }

  // 确保轮播图容器和项占满宽度
  ::v-deep .el-carousel {
    width: 100%;
    height: 100%;
  }

  ::v-deep .el-carousel__container {
    width: 100%;
    height: 100%;
  }

  ::v-deep .el-carousel__item {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
.center-news {
  flex: 1;
  background: #fff;
  height: 510px;
  display: flex;
  flex-direction: column;
  .news-header {
    padding: 24px 28px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #10a593;
    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #0a3f63;
    }
    .more-link {
      font-size: 14px;
      color: #10a593;
      cursor: pointer;
      transition: color 0.2s ease;
      &:hover {
        color: #0d8578;
      }
    }
  }
  .news-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .news-item {
    display: flex;
    gap: 16px;
    padding: 14px;
    background: #f7fcfb;
    border-radius: 12px;
    border-left: 3px solid #10a593;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
      transform: translateX(4px);
      background: #ecf9f7;
      box-shadow: 0 4px 12px rgba(16, 165, 147, 0.15);
    }
  }
  .news-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    .date-day {
      font-size: 26px;
      font-weight: 700;
      color: #10a593;
      line-height: 1;
    }
    .date-month {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
  }
  .news-content {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .news-title {
    font-size: 14px;
    line-height: 1.6;
    color: #1e293b;
    font-weight: 500;
  }
}
.content {
  padding: 48px 32px 60px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-column-gap: 32px;
  grid-row-gap: 28px;
  .itemInfo {
    display: flex;
    min-height: 110px;
    align-items: center;
    padding: 28px 36px;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 3px 7px #10a59329;
    cursor: pointer;
    gap: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(16, 165, 147, 0.15);
    }
    .item-image {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 90px;
      .info-img {
        height: 74px;
        border-radius: 50%;
      }
      .info-img-single {
        height: 74px;
        width: auto;
      }
    }
    .topBox {
      display: flex;
      flex-direction: column;
      .name {
        font-weight: 500;
        font-size: 18px;
        color: #1e1e1e;
        line-height: 34px;
      }
      .desc {
        color: #aaa;
        font-weight: 500;
        font-size: 14px;
        line-height: 34px;
      }
    }
  }
}

@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
    padding: 32px 16px 48px;
  }
}
</style>
