<template>
  <div class="flex">
    <template v-if="!isMobile">
      <!--全屏 -->
      <div class="setting-item" @click="toggle">
        <svg-icon
          :icon-class="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
        />
      </div>

      <!-- 布局大小 -->
      <el-tooltip
        :content="$t('sizeSelect.tooltip')"
        effect="dark"
        placement="bottom"
      >
        <size-select class="setting-item" />
      </el-tooltip>

      <!-- 语言选择 -->
      <lang-select class="setting-item" />

      <!-- 通知消息 -->
      <Notification class="setting-item" />

      <!-- <div class="setting-item mr-4" @click="openDrawer">
        <el-badge
          :show-zero="false"
          :value="readCount"
          :max="99"
          :offset="[5, 12]"
        >
          <el-icon class="notification-icon">
            <Bell />
          </el-icon>
        </el-badge>
      </div> -->
    </template>

    <!-- 用户头像 -->
    <el-dropdown class="setting-item" trigger="click">
      <div class="flex-center h100% p10px">
        <img
          v-if="userStore.user.avatar"
          :src="userStore.user.avatar + '?imageView2/1/w/80/h/80'"
          class="rounded-full mr-10px w24px w24px"
        />
        <img
          v-else
          class="rounded-full mr-10px w24px w24px"
          src="../../../../assets/images/default-avatar.png"
        />
        <span>{{ userStore.user.nickname }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- <a
            target="_blank"
            href="https://gitee.com/youlaiorg/vue3-element-admin"
          >
            <el-dropdown-item>{{ $t("navbar.gitee") }}</el-dropdown-item>
          </a>
          <a target="_blank" href="https://juejin.cn/post/7228990409909108793">
            <el-dropdown-item>{{ $t("navbar.document") }}</el-dropdown-item>
          </a> -->
          <el-dropdown-item @click="toProfile"> 个人中心 </el-dropdown-item>
          <el-dropdown-item @click="logout">
            {{ $t("navbar.logout") }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 设置 -->
    <template v-if="defaultSettings.showSettings">
      <div class="setting-item" @click="settingStore.settingsVisible = true">
        <svg-icon icon-class="setting" />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import Notification from "./NotificationMsg.vue";
import {
  useAppStore,
  useTagsViewStore,
  useUserStore,
  useSettingsStore,
  useNotificationStore,
} from "@/store";
import defaultSettings from "@/settings";
import { DeviceEnum } from "@/enums/DeviceEnum";
import TicketsAPI from "@/api/tickets";
import { Delete, Message } from "@element-plus/icons-vue";
import {
  ticketNotificationsReq,
  ApiResponse,
  NotificationItem,
} from "@/api/tickets/model";
const notifications = ref<NotificationItem[]>([]);
const selectedNotifications = ref<number[]>([]);
const selectAll = ref<boolean>(false);
const currentTab = ref("unread");
import { ElMessageBox } from "element-plus";
import type { DrawerProps } from "element-plus";
const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("rtl");
const typeOptions = ["全部", "分配", "完成", "接受", "回退", "催单"]; // 状态选项
const typeMapping: Record<string, number> = {
  全部: 0,
  分配: 1,
  完成: 3,
  接受: 2,
  回退: 5,
  催单: 4,
};
// 时间格式化
function formatDate(dateTimeString: string | undefined): string {
  if (!dateTimeString) return ""; // 处理空值情况

  const date = new Date(dateTimeString);
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}`;

  return formattedDate;
}
// 鼠标移入
const handleMouseEnter = (item: any) => {
  item.showActions = true;
};
// 鼠标移出
const handleMouseLeave = (item: any) => {
  item.showActions = false;
};
// 删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("确定要删除选中的通知吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    TicketsAPI.NoticeDelData([id]).then(() => {
      ElMessage.success("删除成功");
      notifications.value = []; // 清空通知列表
      queryParams.pageNum = 1; // 重置分页参数
      // handleData();
      refreshData();
      unreadMessageCount();
    });
  });
};
// 详情
const showDetails = async (ticketId: number, id: number, item: any) => {
  console.log(item);

  if (id !== undefined) {
    await TicketsAPI.readNotice(id);
  }
  await router.push({
    path: "/workorder/processingticket",
    query: { id: ticketId.toString() },
  });
  drawer.value = false;
  // 更新 lastUpdated，触发订阅者获取最新数据
  notificationStore.updateLastUpdated();
};
const { t } = useI18n();

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();
const settingStore = useSettingsStore();
const notificationStore = useNotificationStore();

const route = useRoute();
const router = useRouter();

const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE);

const { isFullscreen, toggle } = useFullscreen();

const queryParams: ticketNotificationsReq = {
  type: "",
  isRead: "",
  pageNum: 1,
  pageSize: 10,
};
// 卡片颜色和文字
const getTypeClass = (
  type: number
): { className: string; statusText: string } => {
  switch (type) {
    case 1:
      return { className: "type1-card", statusText: "分配成功" };
    case 3:
      return { className: "type2-card", statusText: "完成成功" };
    case 2:
      return { className: "type3-card", statusText: "接受成功" };
    case 4:
      return { className: "type4-card", statusText: "催单成功" };
    case 5:
      return { className: "type5-card", statusText: "回退成功" };
    default:
      return { className: "default-card", statusText: "未知状态" };
  }
};

// 查询通知
// const handleData = () => {
//   if (notifications.value.length > 0 && notifications.value.length < 10) {
//     return;
//   }
//   TicketsAPI.NotificationData(queryParams).then((data: +any) => {
//     notifications.value.push(...data.list);
//   });
// };

const handleData = async () => {
  if (!hasMoreData.value || isLoading || isRefreshing) return;

  isLoading = true;
  try {
    await TicketsAPI.NotificationData(queryParams).then((data: any) => {
      if (data.list && data.list.length > 0) {
        notifications.value.push(...data.list);
        // 判断是否还有更多数据
        if (data.list.length < queryParams.pageSize) {
          hasMoreData.value = false; // 数据已全部加载完
        }
      } else {
        hasMoreData.value = false; // 没有更多数据
      }
    });
  } finally {
    isLoading = false;
  }
};

let isRefreshing = false; // 标记是否处于刷新状态
let isLoading = false; // 防止多次请求
const hasMoreData = ref(true); // 标记是否有更多数据

// // 初次刷新并加载第一页数据
const refreshData = async () => {
  if (isLoading) return; // 避免重复请求
  isRefreshing = true;
  isLoading = true;

  // 重置页码并清空现有数据
  queryParams.pageNum = 1;
  notifications.value = [];
  hasMoreData.value = true; // 重置标记，允许加载更多数据

  // 获取第一页数据
  try {
    await TicketsAPI.NotificationData(queryParams).then((data: any) => {
      if (data.list && data.list.length > 0) {
        notifications.value = data.list || [];
        // 判断是否还有更多数据
        if (data.list.length < queryParams.pageSize) {
          hasMoreData.value = false;
        }
      } else {
        hasMoreData.value = false;
      }
    });
  } finally {
    isLoading = false;
    isRefreshing = false;
  }
};

// 滚动加载下一页数据 （加载更多数据）
const loadMoreData = async () => {
  if (!hasMoreData.value) return; // 没有更多数据时停止加载
  queryParams.pageNum += 1;
  await handleData();
};

// 监听 lastUpdated 的变化，每次变化时触发数据获取
// watch(
//   () => notificationStore.lastUpdated,
//   async (newTime, oldTime) => {
//     if (newTime !== oldTime) {
//       console.log("lastUpdated 更新了，重新获取数据");
//       // 每次 lastUpdated 更新时，调用获取通知数据的方法
//       // await handleData();
//       refreshData(); // lastUpdated 更新时刷新数据
//       unreadMessageCount(); // lastUpdated 更新时重新获取未读消息数据
//     }
//   }
// );

// 清除全部
const handleBatchDelete = () => {
  if (notifications.value.length === 0) {
    return;
  }
  ElMessageBox.confirm("确定要删除所有通知吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const idsToDelete = notifications.value.map((item) => item.id);
    TicketsAPI.NoticeDelData(idsToDelete).then(() => {
      ElMessage.success("删除成功");

      notifications.value = []; // 清空通知列表
      queryParams.pageNum = 1; // 重置分页参数

      // handleData();
      refreshData();
      unreadMessageCount();
    });
  });
};
// 打开抽屉并发送请求
const openDrawer = () => {
  drawer.value = true;
  // handleData(); // 获取数据
  refreshData(); // 初次加载数据
};
const readCount = ref();
// 我的通知未读总数
const unreadMessageCount = async () => {
  readCount.value = await TicketsAPI.getMeCount();
  console.log("count:", readCount.value);
};

// 处理滚动事件
const handleScroll = () => {
  // queryParams.pageNum++;
  // handleData();
  if (hasMoreData.value) {
    loadMoreData();
  }
};
/**
 * 注销
 */
function logout() {
  ElMessageBox.confirm(
    `${t("NavbarRight.Are_you_sure_system")}?`,
    t("NavbarRight.prompt"),
    {
      confirmButtonText: t("NavbarRight.confirm"),
      cancelButtonText: t("NavbarRight.cancel"),
      type: "warning",
      lockScroll: false,
    }
  ).then(() => {
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        router.push(`/login?redirect=${route.fullPath}`);
      });
  });
}
// 个人中心
const toProfile = () => {
  router.push("/profile/profile");
};
watch(selectedNotifications, (newValue) => {
  if (newValue.length === notifications.value.length) {
    selectAll.value = true;
  } else {
    selectAll.value = false;
  }
});
onMounted(() => {
  handleData();
  unreadMessageCount();
});
</script>
<style lang="scss" scoped>
.setting-item {
  position: relative;
  display: inline-block;
  min-width: 40px;
  height: $navbar-height;
  line-height: $navbar-height;
  color: var(--el-text-color);
  text-align: center;
  cursor: pointer;

  &:hover {
    background: rgb(0 0 0 / 10%);
  }
}

.layout-top,
.layout-mix {
  .setting-item,
  .notify-item,
  .el-icon {
    color: var(--el-color-white);
  }
}

.dark .setting-item:hover {
  background: rgb(255 255 255 / 20%);
}

.card-container {
  position: relative;
  margin-top: -5px;
  overflow: hidden;
}

.card-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.el-card {
  position: relative;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.card-actions {
  position: absolute;
  top: 0; /* 上边界居中 */
  right: -80px;
  z-index: 10;
  display: flex;
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  width: 80px;
  height: 80%;
  margin: 10px 0;
  background-color: #f0f0f0;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  transition: transform 0.5s ease;
}

.card-wrapper:hover .el-card {
  transform: translateX(-80px);
}

.card-wrapper:hover .card-actions {
  transform: translateX(-80px);
}

.batch-delete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cardList {
  height: 86px;
  margin: 10px 0;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: transform 0.5s ease;

  .el-checkbox {
    display: block;
    margin-top: -10px;
  }
}

.checkbox-wrapper {
  position: absolute;
  top: 16px;
  left: 10px;

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
}

.card-header {
  position: absolute;
  top: 5px;
  left: 10px;
  font-size: 16px;
}

.content {
  position: absolute;
  right: 10px;
  bottom: 30px;
  font-size: 14px;
}

.sender {
  position: absolute;
  bottom: 0;
  left: 10px;
  font-size: 12px;
}

.time {
  position: absolute;
  right: 10px;
  bottom: 0;
  font-size: 12px;
}

.cardList span {
  display: block;
  margin-bottom: 5px;
}

.custom-drawer .el-drawer__header {
  padding: 10px;
  background-color: #f5f5f5;
}

.hender {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.drawer-body {
  position: sticky;
  top: -20px;
  z-index: 1000;
  background-color: #fff;
}

.tab-switch {
  display: flex;
  justify-content: center;
  margin: -20px 10px 10px;
}

.tab-switch el-button {
  padding: 10px 20px;
  margin: 0 10px;
  cursor: pointer;
  background-color: #f5f5f5;
  border: none;
}

.tab-switch button.active {
  color: white;
  background-color: #409eff;
}

.type-switch {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.type-switch button {
  flex: 1;
  margin: 0 4px;
  cursor: pointer;
}

.type-switch .active {
  color: white;
  background-color: #409eff;
}

.notification-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
}

.notification-data {
  position: absolute;
  top: 6px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  font-size: 10px;
  line-height: 1;
  color: white;
  background-color: red;
  border-radius: 50%;
}

.type1-card {
  color: #4e93ee !important;
  background-color: #e7eff8;
}

.type2-card {
  color: #67c23a !important;
  background-color: #e9f7e3;
}

.type3-card {
  color: #4e93ee !important;
  background-color: #e7eff8;
}

.type4-card {
  color: #dd9a36 !important;
  background-color: #fdf4e6;
}

.type5-card {
  color: #dd3636 !important;
  background-color: #fff;
}

.default-card {
  color: #ebeef5 !important;
  background-color: #fff;
}

.notification-icon {
  width: 14px;
  height: 14px;
}
</style>
