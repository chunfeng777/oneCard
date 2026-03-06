<template>
  <div class="dashboard-container">
    <!-- github角标 -->
    <!-- <github-corner class="github-corner" /> -->
    <!-- 个人信息展示 -->
    <el-card shadow="never">
      <el-row justify="space-between">
        <el-col :span="18" :xs="24">
          <div class="flex h-full items-center">
            <img
              v-if="userStore.user.avatar"
              class="w-20 h-20 mr-5 rounded-full"
              :src="userStore.user.avatar + '?imageView2/1/w/80/h/80'"
            />
            <img
              v-else
              class="w-20 h-20 mr-5 rounded-full"
              src="../../assets/images/default-avatar.png"
              alt="默认头像"
            />
            <div>
              <p>{{ greetings }}</p>
              <p class="text-sm text-gray">欢迎使用百川云创后台管理系统。</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <div class="personal-center mt-3">
      <!-- 工单计算显示 -->
      <div class="user-info">
        <el-card>
          <div>
            <!-- <p>用户名: {{ userStore.user.username || "未定义" }}</p>
            <p>用户昵称: {{ userStore.user.nickname || "未定义" }}</p> -->
            <el-row class="justify-between">
              <el-col :span="14" :xs="24">
                <div class="flex h-full items-center justify-between">
                  <el-statistic
                    v-for="item in statisticData"
                    :key="item.key"
                    :value="item.value"
                  >
                    <template #title>
                      <div class="flex items-center">
                        <svg-icon :icon-class="item.iconClass" size="20px" />
                        <span class="text-[16px] ml-1">{{ item.title }}</span>
                      </div>
                    </template>
                    <!-- <template v-if="item.suffix" #suffix>{{
                      item.suffix
                    }}</template> -->
                  </el-statistic>
                </div>
              </el-col>
              <el-col
                :span="4"
                class="colContainer cursor-pointer"
                @click="navigateToCreateTicket"
              >
                <img
                  src="../../assets/icons/dict.svg"
                  class="imgContainer"
                  alt=""
                />
                <span class="buttonText">发起通知</span>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </div>

    <div class="personal-center mt-3">
      <!-- 预留模块 -->
      <el-card v-if="hasAnyPermission(modules)">
        <div class="grid-container">
          <div
            v-for="(module, index) in modules"
            :key="index"
            class="grid-item"
            @click="goToModule(module.route)"
            v-hasPerm="[module.perm]"
          >
            <img
              v-if="module.img"
              :src="module.img"
              alt=""
              class="module-img"
            />
            <div>{{ module.name }}</div>
            <!-- 流程处理的红色小点 -->
            <div
              v-if="module.name === '流程处理' && hasTodos"
              class="red-dot"
            ></div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据卡片 -->
    <!-- <el-row :gutter="10" class="mt-3">
      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
        v-for="(item, index) in cardData"
        :key="index"
      >
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]">{{
                item.title
              }}</span>
              <el-tag :type="item.tagType">
                {{ item.tagText }}
              </el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(item.count) }}
            </div>
            <svg-icon :icon-class="item.iconClass" size="2em" />
          </div>

          <div
            class="flex items-center justify-between mt-5 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span> {{ item.dataDesc }} </span>
            <span> {{ Math.round(item.count * 15) }} </span>
          </div>
        </el-card>
      </el-col>
    </el-row> -->

    <!-- Echarts 图表 -->
    <el-row :gutter="10" class="mt-3">
      <el-col
        :xs="24"
        :sm="12"
        :lg="8"
        class="mb-2"
        v-for="item in chartData"
        :key="item"
        v-show="hasPermission('das:chart:view')"
      >
        <!-- v-if="hasPermission('das:chart:view')"  -->
        <!-- v-hasPerm="['das:chart:view']" -->

        <component
          :is="chartComponent(item)"
          :id="item"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
      <!-- 公告通知 -->
      <el-col :xs="24" :sm="12" :lg="12">
        <el-card class="notice-log">
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <span class="announcement">公告通知</span>
                <svg-icon icon-class="trumpet" size="20px" />
              </div>
              <el-button size="small" type="primary" @click="findAllNotice"
                ><i-ep-MoreFilled />更多</el-button
              >
            </div>
          </template>
          <!-- 显示通知列表 -->
          <div v-if="firstFive.length > 0">
            <div class="flex flex-wrap gap-6">
              <div style="width: 100%" v-for="not in firstFive" :key="not.id">
                <div class="w-full" @dblclick="readNotice(not)">
                  <div class="flex">
                    <DictLabel v-model="not.type" code="notice" class="mr-2" />
                    <!-- 使用 el-popover 显示完整标题 -->
                    <el-popover
                      v-if="isLongTitle(not.title)"
                      trigger="hover"
                      placement="top"
                      effect="dark"
                    >
                      <template #reference>
                        <!-- 显示标题的前8个字符 -->
                        {{ getShortTitle(not.title) }}
                      </template>
                      <!-- 显示完整的标题内容 -->
                      <div>{{ not.title }}</div>
                    </el-popover>
                    <!-- 标题不超过 8 个字符时直接显示 -->
                    <div v-else>
                      {{ not.title }}
                    </div>
                  </div>
                  <div>{{ formatTimeData(not.createTime) }}</div>
                  <!-- <el-button
                    type="primary"
                    size="small"
                    @click="handleDetail(not)"
                    ><i-ep-link />详情</el-button
                  > -->
                </div>
              </div>
            </div>
          </div>
          <!-- 如果没有通知，显示提示 -->
          <div v-else>
            <p>暂无公告通知</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 日历 -->
    <!--   <el-row :gutter="10" class="mt-3">
      <el-col :xs="24" :sm="12" :lg="12" class="mb-24">
        <el-card>
          <el-calendar v-model="value" />
        </el-card>
      </el-col>
    </el-row> -->

    <!-- 详情对话框 -->
    <!-- <el-dialog :title="title" v-model="open" width="780px" append-to-body>
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入公告标题"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="type">
              <dictionary
                v-model="form.type"
                type-code="notice"
                placeholder="请选择公告类型"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布人" prop="createName">
              <el-input v-model="form.createName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布时间" prop="createTime">
              <el-input :value="formatTime(form.createTime)" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status" disabled>
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <el-input
                type="textarea"
                v-model="form.content"
                :rows="10"
                placeholder="请输入内容"
                disabled
                :style="{ fontSize: '18px' }"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog> -->
    <!-- 详情组件 -->
    <NoticeDetailDialog
      :model-value="open"
      :notice="selectedNotice"
      @update:model-value="open = $event"
    />
  </div>
</template>

<script setup lang="ts">
import type { EpPropMergeType } from "element-plus/es/utils/vue/props/types";
import dayjs from "dayjs";
import NoticeAPI from "@/api/notice";
import NoticeDetailDialog from "./components/NoticeDetailDialog.vue";
import { usePermissionStore } from "@/store/modules/permission";

import { addReqData } from "@/api/notice/model";
import "./custom-element-ui.scss";
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});
import TicketAPI from "@/api/workorder";
import orgAPI from "@/api/org";

import { useUserStore } from "@/store/modules/user";
import { useTransition, TransitionPresets } from "@vueuse/core";
const router = useRouter();
import { useRouter, useRoute } from "vue-router";
import daily from "@/assets/images/daily.png";
import weekly from "@/assets/images/weekly.png";
import workReport from "@/assets/images/workReport.png";
import expenses from "@/assets/images/expenses.png";
import meeting from "@/assets/images/meeting.png";
const route = useRoute();
const value = ref(new Date());
const userStore = useUserStore();
const permissionStore = usePermissionStore();
const date: Date = new Date();

const firstFive = ref<addReqData[]>([]);
const open = ref(false);
const selectedNotice = ref<addReqData | null>(null);
// const title = ref("公告详情");
// const form = reactive({
//   title: "",
//   type: "",
//   createName: "",
//   createTime: "",
//   status: 1,
//   content: "",
// });
// 时间格式化
// const formatTime = (time: any) => {
//   if (!time) return "";
//   return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
// };
const formatTimeData = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD"); // 只格式化为 年-月-日
};

// 方法用于获取短标题
const getShortTitle = (title: any) => {
  return title.length > 8 ? title.slice(0, 8) + "..." : title;
};
// 判断标题是否超过8个字符的函数
const isLongTitle = (title: any) => {
  return title.length > 8;
};

// 发起通知
const navigateToCreateTicket = () => {
  router.push({
    path: "/workorder/createticket",
  });
};

const mockData = [
  {
    name: "日报",
    route: "/reporting/daily",
    img: daily,
    perm: "sys:reporting:daily",
  },
  {
    name: "日报专用",
    route: "/reporting/dailySpecial",
    img: daily,
    perm: "sys:reporting:dailySpecial",
  },
  {
    name: "周报",
    route: "/reporting/weekly",
    img: weekly,
    perm: "sys:reporting:weekly",
  },
  {
    name: "工作汇报",
    route: "/reporting/workReport",
    img: workReport,
    perm: "sys:reporting:workReport",
  },
  {
    name: "费用收支",
    route: "/finance/expenses",
    img: expenses,
    perm: "sys:finance:expenses",
  },
  {
    name: "会议总结",
    route: "/reporting/meeting",
    img: meeting,
    perm: "sys:meeting:summary",
  },
  {
    name: "流程处理",
    route: "/wflow/myPending",
    img: meeting,
    perm: "sys:wflow:myPending",
  },
];
const modules = ref(mockData);
// 检查用户是否有权限访问 modules 数组中的任何一个模块
function hasAnyPermission(modules: any) {
  return modules.some((module: any) =>
    userStore.user.perms.includes(module.perm)
  );
}

const todoList = ref();

const getToDoList = async () => {
  const res: any = await orgAPI.postToDoList({
    pageNum: 1,
    pageSize: 10,
  });
  console.log(res.total);
  todoList.value = res.total;
};

const hasTodos = computed(() => todoList.value > 0);

// 点击模块时导航到对应的路由页面
const goToModule = (route: string) => {
  if (route) {
    // console.log(route);
    router.push({
      path: route,
    });
  } else {
    console.error("该模块没有路由信息！");
  }
};

const greetings = computed(() => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return "上午好，" + userStore.user.nickname + "！";
  } else if (hours >= 12 && hours < 18) {
    return "下午好，" + userStore.user.nickname + "！";
  } else if (hours >= 18 && hours < 24) {
    return "晚上好，" + userStore.user.nickname + "！";
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

const duration = 5000;

// 销售额
const amount = ref(0);
const amountOutput = useTransition(amount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
amount.value = 2000;

// 访客数
const visitCount = ref(0);
const visitCountOutput = useTransition(visitCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
visitCount.value = 2000;

// IP数
const dauCount = ref(0);
const dauCountOutput = useTransition(dauCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
dauCount.value = 2000;

// 订单量
const orderCount = ref(0);
const orderCountOutput = useTransition(orderCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
orderCount.value = 2000;

// 右上角数量
const statisticData = ref([
  {
    value: 10,
    iconClass: "message",
    title: "未完成通知",
    key: "message",
  },
  {
    value: 0,
    iconClass: "todolist",
    title: "紧急提醒",
    suffix: "/100",
    key: "upcoming",
  },
  {
    value: 0,
    iconClass: "project",
    title: "已完成",
    key: "project",
  },
]);

interface CardProp {
  title: string;
  tagType: EpPropMergeType<
    StringConstructor,
    "primary" | "success" | "info" | "warning" | "danger",
    unknown
  >;
  tagText: string;
  count: any;
  dataDesc: string;
  iconClass: string;
}
// 卡片数量
const cardData = ref<CardProp[]>([
  {
    title: "访客数",
    tagType: "success",
    tagText: "日",
    count: visitCountOutput,
    dataDesc: "总访客数",
    iconClass: "visit",
  },
  {
    title: "IP数",
    tagType: "success",
    tagText: "日",
    count: dauCountOutput,
    dataDesc: "总IP数",
    iconClass: "ip",
  },
  {
    title: "销售额",
    tagType: "primary",
    tagText: "月",
    count: amountOutput,
    dataDesc: "总IP数",
    iconClass: "money",
  },
  {
    title: "订单量",
    tagType: "danger",
    tagText: "季",
    count: orderCountOutput,
    dataDesc: "总订单量",
    iconClass: "order",
  },
]);
// 图表数据
const chartData = ref([
  "Charts",
  "QuarterlyCharts",
  "AnnualCharts",
  "ClassifyCharts",
]);

// 图表组件加载函数
const hasPermission = (permission: string) => {
  return userStore.user.perms.includes(permission);
};

// const chartComponent = (item: string) => {
//   return defineAsyncComponent(() => import(`./components/${item}.vue`));
// };

// console.log("权限", userStore.user.perms);
// console.log("角色", userStore.user.roles);

// 图表组件加载函数
// 费用收支新建按钮权限标识 das:chart:view
const chartComponent = (item: string) => {
  if (hasPermission("das:chart:view")) {
    return defineAsyncComponent(() => import(`./components/${item}.vue`)); // 只有有权限时才加载组件
  } else {
    return null; // 如果没有权限，返回 null，不加载组件
  }
};
const notNotif = ref();
const completNotif = ref();
const urgentReminder = ref();

// 未完成的通知
const not = () => {
  TicketAPI.notNotif().then((resp) => {
    notNotif.value = resp;
    statisticData.value[0].value = notNotif.value;
  });
};
// 紧急提醒
const reminder = () => {
  TicketAPI.urgentReminder().then((resp) => {
    urgentReminder.value = resp;
    statisticData.value[1].value = urgentReminder.value;
  });
};
// 已完成的通知
const complet = () => {
  TicketAPI.completNotif().then((resp) => {
    completNotif.value = resp;
    statisticData.value[2].value = completNotif.value;
  });
};

// 跳转到全部公告通知
const findAllNotice = () => {
  router.push("/findAllNotice/findAllNotice");
};
// 前五条通知
const firstFiveNotice = () => {
  NoticeAPI.firstFiveNotice().then((resp: any) => {
    firstFive.value = resp;
  });
};
// 详情
// const handleDetail = (not: any) => {
//   NoticeAPI.getNotice(not.id).then((resp) => {
//     Object.assign(form, resp);
//   });
//   open.value = true;
// };
const readNotice = (not: any) => {
  selectedNotice.value = not.id;
  open.value = true;
};
// 在组件挂载后再次调用这些方法
// onMounted(() => {
//   not();
//   reminder();
//   complet();
// });

// 监听路由变化，当路由变化时重新请求数据
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath === "/dashboard") {
      not();
      reminder();
      complet();
      firstFiveNotice();
    }
  },
  { immediate: true }
);
onMounted(() => {
  getToDoList();

  // 定期刷新 todoList
  const refreshInterval = setInterval(() => {
    getToDoList();
  }, 1800000); // 30分钟刷新一次

  onUnmounted(() => {
    clearInterval(refreshInterval);
  });
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .data-box {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: bold;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .svg-icon {
    fill: currentcolor !important;
  }

  .imgContainer {
    height: 30px;
  }

  .colContainer {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(
      5,
      1fr
    ); /* 将容器分成5列，每列平均分配剩余空间 */

    grid-gap: 10px; /* 设置网格间隙 */
  }

  .grid-item {
    position: relative;
    display: flex;
    gap: 15px;
    align-items: center;
    padding: 20px;
    cursor: pointer;
    background-color: #f7f7f7;
    border: 1px solid #f7f3f3;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgb(224 218 218 / 10%); /* 添加阴影 */

    .module-img {
      width: 40px;
      height: 40px;
    }

    .red-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background-color: red;
      border-radius: 50%;
    }
  }

  .notice-log {
    .w-full {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      border: 1px solid #ebebeb;
      border-radius: 6px;
    }

    .announcement {
      margin-right: 16px;
      font-size: 26px;
      font-weight: 900;
    }
  }
}
</style>
