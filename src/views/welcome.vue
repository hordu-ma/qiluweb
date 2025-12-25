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
    <div class="welcome-carousel">
      <el-carousel :interval="4000" height="510px">
        <el-carousel-item v-for="(image, index) in carouselImages" :key="index">
          <img :src="image.url" :alt="image.title" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
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
import Bg1 from "../images/bg1.jpg";
import Bg2 from "../images/bg2.jpg";
import Bg3 from "../images/bg3.jpg";

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
      const contentEl = document.querySelector(".content");
      if (contentEl) {
        contentEl.addEventListener("scroll", this.handleScroll);
      }
    });
  },
  beforeDestroy() {
    const contentEl = document.querySelector(".content");
    if (contentEl) {
      contentEl.removeEventListener("scroll", this.handleScroll);
    }
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
      const contentEl = document.querySelector(".content");
      if (!contentEl || this.isLoading || !this.hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = contentEl;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
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
  height: 100vh;
  width: 100vw;
}
.welcome-header {
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
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.2s ease;
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
.welcome-carousel {
  width: 100%;
  height: 510px;

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover; // 保持图片比例，填满容器
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
.content {
  flex: 1;
  padding-left: 160px;
  padding-right: 45px;
  padding-top: 45px;
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  .itemInfo {
    display: flex;
    height: 110px;
    align-items: center;
    padding: 28px 42px;
    margin-right: 28px;
    margin-bottom: 30px;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 3px 7px #10a59329;
    cursor: pointer;
    .item-image {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      .info-img {
        height: 74px;
        border-radius: 50%;
      }
      .info-img-single {
        // width: 100%;
        height: 74px;
      }
    }
    .topBox {
      display: flex;
      flex-direction: column;
      margin-left: 32px;
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
</style>
