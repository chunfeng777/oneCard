<template>
  <div>
    <el-dropdown
      @visible-change="handleVisibleChange"
      trigger="click"
      class="flex-center wh-full align-middle"
    >
      <div class="wh-full">
        <el-badge
          v-if="readCount > 0"
          :offset="[-10, 15]"
          :value="readCount"
          :max="99"
          class="wh-full"
        >
          <el-icon class="notification-icon h-full">
            <Bell />
          </el-icon>
        </el-badge>
        <el-badge v-else class="wh-full">
          <el-icon class="notification-icon h-full">
            <Bell />
          </el-icon>
        </el-badge>
      </div>

      <template #dropdown>
        <div class="p-2">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="公告" name="notice">
              <template v-if="announcement.length > 0">
                <div
                  v-for="(item, index) in announcement"
                  :key="index"
                  class="w350px flex-x-between p-1"
                >
                  <div class="flex-center">
                    <DictLabel
                      v-model="item.type"
                      code="notice"
                      size="small"
                      class="mr-1"
                    />
                    <el-text
                      type="primary"
                      size="small"
                      class="w150px cursor-pointer"
                      truncated
                      @click="readNotice(item)"
                    >
                      {{ item.title }}
                    </el-text>
                  </div>
                  <div v-if="item.updateTime">
                    {{ item.updateTime }}
                  </div>
                  <div v-else>
                    {{ item.createTime }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex-center h150px w350px">
                  <el-empty :image-size="50" description="暂无公告" />
                </div>
              </template>
              <el-divider />
              <div class="flex-x-between">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="findAllNotice"
                >
                  <span class="text-xs">查看更多</span>
                  <el-icon class="text-xs">
                    <ArrowRight />
                  </el-icon>
                </el-link>
                <el-link
                  v-if="announcement.length > 0"
                  type="primary"
                  :underline="false"
                  @click="announcementAllAsRead"
                >
                  <span class="text-xs">全部已读</span>
                </el-link>
              </div>
            </el-tab-pane>

            <el-tab-pane label="工单" name="message">
              <template v-if="workorder.length > 0">
                <div
                  v-for="(item, index) in workorder"
                  :key="index"
                  class="w350px flex-x-between p-1"
                >
                  <div class="flex-center">
                    <DictLabel
                      v-model="item.type"
                      code="ticketsNoticeType"
                      size="small"
                      class="mr-1"
                    />
                    <el-text
                      type="primary"
                      size="small"
                      class="w150px cursor-pointer"
                      truncated
                      @click="showDetails(item.ticketId, item.id, item)"
                    >
                      {{ item.content }}
                      <!-- {{ item.title }} -->
                    </el-text>
                  </div>
                  <div>
                    {{ item.sendTime }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex-center h150px w350px">
                  <el-empty :image-size="50" description="暂无工单" />
                </div>
              </template>
              <el-divider />
              <div class="flex-x-between">
                <el-link type="primary" :underline="false" @click="ticketAll">
                  <span class="text-xs">查看更多</span>
                  <el-icon class="text-xs">
                    <ArrowRight />
                  </el-icon>
                </el-link>
                <el-link
                  v-if="workorder.length > 0"
                  type="primary"
                  :underline="false"
                  @click="workorderAllAsRead"
                >
                  <span class="text-xs">全部已读</span>
                </el-link>
              </div>
            </el-tab-pane>

            <el-tab-pane label="汇报" name="report">
              <template v-if="report.length > 0">
                <div
                  v-for="(item, index) in report"
                  :key="index"
                  class="w350px flex-x-between p-1"
                >
                  <div class="flex-center">
                    <DictLabel
                      v-model="item.type"
                      code="report"
                      size="small"
                      class="mr-1"
                    />
                    <el-text
                      type="primary"
                      size="small"
                      class="w150px cursor-pointer"
                      truncated
                      @click="readReport(item)"
                    >
                      {{ item.title }}
                    </el-text>
                  </div>
                  <div>
                    {{ item.sendTime }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex-center h150px w350px">
                  <el-empty :image-size="50" description="暂无消息" />
                </div>
              </template>
              <el-divider />
              <div class="flex-x-between">
                <el-link type="primary" :underline="false" @click="reportAll">
                  <span class="text-xs">查看更多</span>
                  <el-icon class="text-xs">
                    <ArrowRight />
                  </el-icon>
                </el-link>
                <el-link
                  v-if="report.length > 0"
                  type="primary"
                  :underline="false"
                  @click="reportAllAsRead"
                >
                  <span class="text-xs">全部已读</span>
                </el-link>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </el-dropdown>

    <!-- 详情组件 -->
    <NoticeDetailDialog
      :model-value="open"
      :notice="selectedNotice"
      @update:model-value="open = $event"
    />

    <!-- 详情组件 -->
    <ReportDetailDialog
      :model-value="openReport"
      :id="selectedReport"
      @update:model-value="openReport = $event"
    />
  </div>
</template>

<script setup lang="ts">
// import NoticeAPI, { NoticePageVO } from "@/api/system/notice";
import NoticeDetailDialog from "@/views/dashboard/components/NoticeDetailDialog.vue";
import ReportDetailDialog from "@/views/dashboard/components/ReportDetailDialog.vue";
import NoticeAPI from "@/api/notice";
import TicketsAPI from "@/api/tickets";
import ReportAPI from "@/api/report";
import { NoticeResponse } from "@/api/notice/model";
import { ticketNotificationsReq } from "@/api/tickets/model";
import { useRouter, useRoute } from "vue-router";
import { useNotificationStore } from "@/store";

const router = useRouter();
const activeTab = ref("notice");

const readCount = ref<any>();
const announcement = ref<NoticeResponse["list"]>([]);
const workorder = ref<any[]>([]);
const report = ref<any[]>([]);

const open = ref(false);
const openReport = ref(false);
const selectedNotice = ref<number>();
const selectedReport = ref<number>();
const notificationStore = useNotificationStore();

const queryParams: ticketNotificationsReq = {
  type: "",
  isRead: "0",
  pageNum: 1,
  pageSize: 5,
};

let timer: any = null;

const noticesData = {
  pageNum: "1",
  pageSize: "5",
  status: "0",
};

const reportData = {
  pageNum: 1,
  pageSize: 5,
  status: "0",
};

// 打开下拉后获取最新数据
const handleVisibleChange = (visible: boolean) => {
  if (visible) {
    getNotices();
    // 在这里添加打开下拉菜单后的处理逻辑
  } else {
    // 在这里添加关闭下拉菜单后的处理逻辑
  }
};

// 获取公告未读总数量
const getNoticeMeCount = async () => {
  readCount.value = 0;
  try {
    const NoticeMeCount = await NoticeAPI.getNoticeMeCount();
    const MeCount = await TicketsAPI.getMeCount();
    const ReportMeCount = await ReportAPI.getReportMeCount();

    readCount.value = NoticeMeCount + MeCount + ReportMeCount;
  } catch (error) {
    console.error("获取未读总数量失败", error);
  }
};

// 获取公告未读列表（5个）
const getNotices = async () => {
  try {
    const res = await NoticeAPI.getNotices(noticesData);
    announcement.value = res.list;
    console.log(announcement.value);
  } catch (error) {
    console.error("获取公告未读列表失败", error);
  }

  try {
    const res = await TicketsAPI.NotificationData(queryParams);
    console.log(res.list);
    workorder.value = res.list;
  } catch (error) {
    console.error("获取工单未读列表失败", error);
  }

  try {
    const res = await ReportAPI.getReportNotices(reportData);
    console.log(res.list);
    report.value = res.list;
  } catch (error) {
    console.error("获取汇报未读列表失败", error);
  }
};

const init = () => {
  getNoticeMeCount();
  getNotices();
  timer = setInterval(getNoticeMeCount, 600000);
};
// 获取未读消息列表并连接 WebSocket
onMounted(() => {
  init();

  // readCount.value = [...announcement.value];
});

// 清除定时器
onBeforeUnmount(() => {
  clearInterval(timer);
});

// 点击查看详情
const readNotice = (not: any) => {
  selectedNotice.value = not.noticeId;
  open.value = true;
};

// 点击查看日报详情
const readReport = (item: any) => {
  selectedReport.value = item.id;
  console.log(item);
  openReport.value = true;
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
  // 更新 lastUpdated，触发订阅者获取最新数据
  notificationStore.updateLastUpdated();
};

// 查看更多
function findAllNotice() {
  router.push("/findAllNotice/findAllNotice");
}
function ticketAll() {
  router.push("/workorder/ticketAll");
}

function reportAll() {
  router.push("/reporting/notificationReport");
}

// 全部已读
function announcementAllAsRead() {
  NoticeAPI.getNoticeReadAll().then(() => {
    // 更新 lastUpdated，触发订阅者获取最新数据
    notificationStore.updateLastUpdated();
  });
}
function workorderAllAsRead() {
  TicketsAPI.DelNotice().then(() => {
    // 更新 lastUpdated，触发订阅者获取最新数据
    notificationStore.updateLastUpdated();
  });
}

function reportAllAsRead() {
  ReportAPI.reportReadAll().then(() => {
    // 更新 lastUpdated，触发订阅者获取最新数据
    notificationStore.updateLastUpdated();
  });
}

// 监听 lastUpdated 的变化，每次变化时触发数据获取
watch(
  () => notificationStore.lastUpdated,
  async (newTime, oldTime) => {
    if (newTime !== oldTime) {
      console.log("lastUpdated 更新了，重新获取数据");
      init(); // 更新通知栏消息
    }
  }
);
</script>

<style lang="scss" scoped>
.layout-top .notification-icon,
.layout-mix .notification-icon {
  color: #fff;
}
</style>
