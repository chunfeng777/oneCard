<template>
  <div>
    <el-drawer
      v-model="localDrawer"
      title="审批详情"
      direction="rtl"
      :style="{ backgroundColor: '#f0f0f0' }"
    >
      <!-- 基本信息 -->
      <div class="drawer-header" v-if="startUser && processDefinitionName">
        <div class="drawer-user">
          <el-avatar :src="startUser.avatar" />
          <div class="drawer-user-name">{{ startUser.name }}</div>
        </div>

        <div
          class="drawer-status"
          v-if="processDefinitionName || businessStatusText"
        >
          <div class="drawer-status-title">
            <div class="drawer-status-title-left">
              <span>{{ processDefinitionName }}</span>
              <el-tag :type="statusTagType">{{ businessStatusText }}</el-tag>
            </div>
            <div v-if="props.businessStatus == 4" @click="showPrintFun(true)">
              <el-icon><Printer /></el-icon>
            </div>
          </div>
          <div class="drawer-status-desc">
            编号：{{ processNumber }}-{{ numberStatus }}
          </div>
          <img :src="statusImage" class="status-image" v-if="statusImage" />
        </div>
      </div>

      <!-- 表单项 -->
      <div
        class="drawer-body"
        v-if="formConfig.components && formConfig.components.length"
      >
        <el-form class="w-form-render">
          <template
            v-for="component in formConfig.components"
            :key="component.id"
          >
            <el-form-item
              :label="component.name"
              :required="component.props.required"
              :prop="component.key"
            >
              <!-- 检查是否为 FileUpload 类型 -->
              <template v-if="component.type === 'FileUpload'">
                <div class="file-upload">
                  <template
                    v-if="component.value && component.value.length > 0"
                  >
                    <div
                      v-for="item in component.value"
                      :key="item.id"
                      class="downloadName"
                      @click="download(item)"
                    >
                      <i-ep-Document />{{ item.name }}
                    </div>
                  </template>
                  <template v-else> 未选择 </template>
                </div>
              </template>
              <!-- 检查是否为 Score 类型 -->
              <template v-else-if="component.type === 'Score'">
                <div class="score-display">
                  {{ component.value ? component.value + " 星" : "0 星" }}
                </div>
              </template>
              <!-- 检查是否为 DateTimePicker 类型 -->
              <template v-else-if="component.type === 'DateTimePicker'">
                <div class="date-time-display">
                  {{ component.value ? component.value : "未选择" }}
                </div>
              </template>
              <!-- 检查是否为 DateTimeRangePicker 类型 -->
              <template v-else-if="component.type === 'DateTimeRangePicker'">
                <div class="date-time-range-display">
                  {{ (component.value && component.value[0]) || "未选择" }} 至
                  {{ (component.value && component.value[1]) || "未选择" }} ~
                  时长：{{ timeLength }}
                </div>
              </template>
              <!-- 检查是否为 UserPicker 类型 -->
              <template v-else-if="component.type === 'UserPicker'">
                <div class="user-picker-display">
                  <template
                    v-if="component.value && component.value.length > 0"
                  >
                    <span
                      v-for="user in component.value"
                      :key="user.id"
                      class="user-info"
                    >
                      <!-- <el-avatar
                      :src="user.avatar"
                      alt="Avatar"
                      class="user-avatar"
                    /> -->
                      <div class="user-name">{{ user.name }}</div>
                    </span>
                  </template>
                  <template v-else> 未选择 </template>
                </div>
              </template>
              <!-- 检查是否为 UserPicker 类型 -->
              <template v-else-if="component.type === 'DeptPicker'">
                <div class="user-picker-display">
                  <template
                    v-if="component.value && component.value.length > 0"
                  >
                    <span
                      v-for="dept in component.value"
                      :key="dept.id"
                      class="user-info"
                    >
                      <div class="user-name">{{ dept.name || "未选择" }}</div>
                    </span>
                  </template>
                  <template v-else> 未选择 </template>
                </div>
              </template>
              <!-- 检查是否为 MultiplePicker 类型 -->
              <template v-else-if="component.type === 'MultiplePicker'">
                <div class="multiple-picker-display">
                  {{ component.value ? component.value.join(", ") : "未选择" }}
                </div>
              </template>
              <!-- 检查是否为 MultiplePicker 类型 -->
              <template v-else-if="component.type === 'SinglePicker'">
                <div class="multiple-picker-display">
                  {{ component.value ? component.value : "未选择" }}
                </div>
              </template>
              <!-- 检查是否为 TableList 类型 -->
              <template v-else-if="component.type === 'TableList'">
                <el-table
                  :data="component.value"
                  :border="component.props.showBorder"
                  style="width: 100%"
                >
                  <!-- 动态渲染列 -->
                  <el-table-column
                    v-for="col in component.props.columns"
                    :key="col.id"
                    :prop="col.key"
                    :label="col.name"
                  >
                    <template #default="{ row }">
                      <span v-if="col.type === 'TextInput'">{{
                        row[col.key]
                      }}</span>
                      <span v-if="col.type === 'TextareaInput'">{{
                        row[col.key]
                      }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </template>

              <!-- 其他类型的组件正常渲染 -->
              <template v-else>
                <component
                  :is="FormComponents[component.type]"
                  :config="component"
                  :value="component.value"
                  :disabled="true"
                />
              </template>
            </el-form-item>
          </template>
        </el-form>
      </div>
      <!-- 流程 -->
      <!-- 自定义时间线 -->
      <div class="custom-timeline" v-if="progress.length">
        <div class="timeline">
          <div
            class="timeline-item"
            v-for="(step, index) in progress"
            :key="index"
          >
            <div class="timeline-avatar-wrapper">
              <!-- 头像逻辑处理 -->
              <el-avatar
                v-if="getActivityUsers(step.activityUser).length === 1"
                :src="getActivityUsers(step.activityUser)[0].avatar"
              >
                <!-- 如果 avatar 为空，显示 step.name 的前两个字 -->
                <template v-if="!getActivityUsers(step.activityUser)[0].avatar">
                  {{ step.name.slice(0, 2) }}
                </template>
                <!-- 添加图标 -->
                <div
                  v-if="step.endTime"
                  :style="{
                    color: 'green',
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                  }"
                >
                  <el-icon><SuccessFilled /></el-icon>
                </div>
              </el-avatar>
              <!-- 如果有多个用户，显示 step.name 的前两个字 -->
              <template v-else>
                <el-avatar>
                  {{ step.name.slice(0, 2) }}
                </el-avatar>
              </template>
            </div>

            <div class="timeline-content">
              <div class="timeline-header">
                <div class="timeline-info">
                  <p class="timeline-title">
                    {{ step.type === "COMMENTS" ? "参与评论" : step.name }}
                  </p>
                  <!-- 内部循环渲染多个用户的头像和名字 -->
                  <div
                    v-if="getActivityUsers(step.activityUser).length > 1"
                    class="inner-avatars"
                  >
                    <div
                      v-for="user in getActivityUsers(step.activityUser)"
                      :key="user.id"
                      class="inner-avatar-wrapper"
                    >
                      <el-avatar :src="user.avatar || ''" class="inner-avatar">
                        <!-- 如果 avatar 为空，则显示 name 的前两个字 -->
                        <template v-if="!user.avatar">
                          {{ user.name.slice(0, 2) }}
                        </template>
                      </el-avatar>
                      <p class="inner-avatar-name">{{ user.name }}</p>
                    </div>
                  </div>
                  <!-- 如果用户只有一个，不显示头像，显示名字 -->
                  <div
                    v-if="getActivityUsers(step.activityUser).length === 1"
                    class="single-user-name"
                  >
                    {{ getActivityUsers(step.activityUser)[0].name }}
                  </div>
                </div>
                <p class="timeline-time">{{ step.endTime || "进行中" }}</p>
              </div>
              <!-- 评论内容渲染 评论数据会单独添加一个节点-->
              <div class="commentBox" v-if="step.type === 'COMMENTS'">
                <div class="comment-text">
                  {{ step.comment }}
                </div>
                <div
                  v-if="step.attachmentVOList && step.attachmentVOList.length"
                  class="attachment-list"
                >
                  <div
                    v-for="attachment in step.attachmentVOList"
                    :key="attachment.fileKey"
                    class="attachment-item"
                  >
                    <div v-if="attachment.isImage">
                      <img
                        :src="attachment.url"
                        class="attachment-image"
                        @click="download(attachment)"
                      />
                    </div>
                    <div v-else>
                      <span class="downloadName" @click="download(attachment)"
                        ><i-ep-Document />{{ attachment.name }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <!-- 撤销没有数据 不做渲染 -->
              <div v-if="step.type === 'OPINION'" class="opcxBox">
                <div v-if="step.comment" class="opinion-text">
                  {{ step.comment }}
                </div>
                <div
                  v-if="step.attachmentVOList && step.attachmentVOList.length"
                  class="attachment-list"
                >
                  <div
                    v-for="attachment in step.attachmentVOList"
                    :key="attachment.fileKey"
                    class="attachment-item"
                  >
                    <div v-if="attachment.isImage">
                      <img :src="attachment.url" class="attachment-image" />
                    </div>
                    <div v-else>
                      {{ attachment.name }}
                    </div>
                  </div>
                </div>
              </div>
              <!-- 同意和驳回 数据添加在审批节点里面   -->
              <div
                v-if="step.type === 'APPROVAL' && step.opinionVOList"
                class="opcxBox"
              >
                <div v-for="opin in step.opinionVOList" :key="opin.comments">
                  <div v-if="opin.comments" class="opinion-text">
                    {{ opin.comments }}
                  </div>
                  <div
                    v-if="opin.attachmentVOList && opin.attachmentVOList.length"
                    class="attachment-list"
                  >
                    <div
                      v-for="attachment in opin.attachmentVOList"
                      :key="attachment.fileKey"
                      class="attachment-item"
                    >
                      <div v-if="attachment.isImage">
                        <img :src="attachment.url" class="attachment-image" />
                      </div>
                      <div
                        v-else
                        class="downloadName"
                        @click="download(attachment)"
                      >
                        <i-ep-Document />
                        {{ attachment.name }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 签名 -->
              <div v-if="step.signatrue" class="signBox">
                <span><i-ep-EditPen />签字：</span>
                <img :src="step.signatrue" alt="" class="signature" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div style="flex: auto" class="button-container">
          <el-button
            type="primary"
            class="button-item"
            @click="openModal('revoke')"
            v-if="
              (lastPart === 'myApplication' &&
                businessStatusText === '审批进行中') ||
              ((lastPart === 'borrow' ||
                lastPart === 'reimbursement' ||
                lastPart === 'reserves') &&
                currentValue === '我发起的' &&
                businessStatusText === '审批进行中')
            "
            >撤销</el-button
          >
          <el-button
            type="success"
            class="button-item"
            @click="openModal('approve')"
            v-if="
              (lastPart === 'myPending' &&
                businessStatusText === '审批进行中') ||
              ((lastPart === 'borrow' ||
                lastPart === 'reimbursement' ||
                lastPart === 'reserves' ||
                lastPart === 'regularization' ||
                lastPart === 'dimission') &&
                currentValue === '待我处理' &&
                businessStatusText === '审批进行中')
            "
            >同意</el-button
          >
          <el-button
            type="danger"
            class="button-item"
            @click="openModal('reject')"
            v-if="
              (lastPart === 'myPending' &&
                businessStatusText === '审批进行中') ||
              ((lastPart === 'borrow' ||
                lastPart === 'reimbursement' ||
                lastPart === 'reserves' ||
                lastPart === 'regularization' ||
                lastPart === 'dimission') &&
                currentValue === '待我处理' &&
                businessStatusText === '审批进行中')
            "
            >驳回</el-button
          >
          <el-button
            type="info"
            class="button-item"
            @click="openModal('comment')"
            v-if="
              ((lastPart === 'myApplication' ||
                lastPart === 'carbonCopy' ||
                lastPart === 'myPending' ||
                lastPart === 'myProcessed') &&
                businessStatusText === '审批进行中') ||
              ((lastPart === 'borrow' ||
                lastPart === 'reimbursement' ||
                lastPart === 'reserves' ||
                lastPart === 'regularization' ||
                lastPart === 'dimission') &&
                (currentValue === '我发起的' ||
                  currentValue === '待我处理' ||
                  currentValue === '已处理的' ||
                  currentValue === '抄送我的') &&
                businessStatusText === '审批进行中')
            "
            ><i-ep-ChatDotRound />评论</el-button
          >
        </div>
      </template>
    </el-drawer>
    <WModal
      :processInstanceId="processInstanceId"
      :taskId="taskId"
      :type="modalType"
      :show="showModal"
      @close="closeModal"
      @update:value="handleModalUpdate"
      @process-completed="handleProcessCompleted"
      :progress="progress"
    />
    <el-dialog v-model="showPrint" title="打印预览" width="800">
      <div class="print" id="print">
        <div>
          <h2 class="printTitle">{{ print.title }}</h2>
          <img :src="statusImage" class="print-image" v-if="statusImage" />
          <div class="printHeader">
            <div>审批编号：{{ print.id }}</div>
            <div>提交时间：{{ print.time }}</div>
          </div>
        </div>
        <table class="printTable">
          <tr>
            <th class="td-title">申请人</th>
            <td>{{ print.name }}</td>
          </tr>
          <tr v-for="(item, index) in print.printForm" :key="index">
            <th class="td-title">{{ item.name }}</th>
            <td>{{ item.value }}</td>
          </tr>
          <tr class="td-title">
            <th :rowspan="print.number">审批流程</th>
          </tr>
          <tr
            v-for="(item, index) in print.printList"
            :key="index"
            class="printList"
          >
            <td>
              <div class="baseInfo">
                <div>{{ item.name }}</div>
                <div>已同意</div>
                <div>{{ item.time }}</div>
              </div>
            </td>
          </tr>
          <tr class="td-title">
            <th>审批结果</th>
            <td>审批通过</td>
          </tr>
        </table>
        <div class="printFooter">
          <div>打印人：{{ print.printname }}</div>
          <div style="text-align: right">打印时间：{{ print.printtime }}</div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPrintFun(false)">取消</el-button>
          <el-button type="primary" v-print="'#print'"> 打印 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { number } from "echarts";
import { ref, watchEffect, watch } from "vue";
import moment from "moment";
import { FormComponents } from "../design/form/FormComponents";
import OrgAPI from "@/api/org";
import passImage from "@/assets/images/pass.png";
import overruleImage from "@/assets/images/overrule.png";
import quashImage from "@/assets/images/quash.png";
import { useUserStore } from "@/store/modules/user";
import WModal from "@/views/wflow/common/WModal.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const isProcessDeleted = ref(false);
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    default: false,
  },
  Id: {
    type: number,
    default: "",
  },
  processInstanceId: {
    type: String,
    default: "",
  },
  taskId: {
    type: String,
    default: "",
  },
  nodeId: {
    type: String,
    default: "",
  },
  processDefinitionName: {
    type: String,
    default: "",
  },
  businessStatus: {
    type: String,
    default: "",
  },
  startUser: {
    type: Object,
    default: () => ({}),
  },
  lastPart: {
    type: String,
    default: "",
  },
  currentValue: {
    type: String,
    default: "",
  },
});

// 定义一个本地变量来追踪drawer状态
const localDrawer = ref();
// const detail = ref();
const activityUser = ref({});
const formConfig = ref({});
const conf = ref({});
const progress = ref([]);
const processNumber = ref("");
const numberStatus = ref("");
//管理打印窗口侧的按钮
const showPrint = ref(false);

//打印数据
const InstanceRes = ref("");

const print = ref({
  title: "",
  id: "",
  time: "",
  name: "",
  printname: "",
  printtime: "",
  printForm: [],
  printList: [],
  number: 1,
});

// 管理 Modal 的显示与关闭
const showModal = ref(false);
const modalType = ref("");

const openModal = (type) => {
  modalType.value = type;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleModalUpdate = () => {
  localDrawer.value = false;
};

// 使用 watchEffect 来观察 props 的变化
watchEffect(() => {
  localDrawer.value = props.isDrawerOpen;
});

const handleProcessCompleted = (data) => {
  // 向父组件发送事件
  emit("processCompleted", data);
};

const InstanceProcess = async () => {
  try {
    const res = await OrgAPI.InstanceProcess({
      processInstanceId: props.processInstanceId,
      taskId: props.taskId,
      nodeId: props.nodeId,
    });

    // activityUser.value = res.progress.activityUser;
    conf.value = JSON.parse(res.formConfig.conf);
    formConfig.value = res.formConfig;
    progress.value = res.progress;
    processNumber.value = res.processNumber;
    numberStatus.value = res.numberStatus;
    isProcessDeleted.value = true;
    InstanceRes.value = res;
  } catch (error) {
    isProcessDeleted.value = false; // 设置为不存在
  }
};

const statusTagType = computed(() => {
  switch (props.businessStatus) {
    case "1":
      return "primary";
    case "2":
      return "info";
    case "3":
      return "danger";
    default:
      return "success";
  }
});

const businessStatusText = computed(() => {
  switch (props.businessStatus) {
    case "1":
      return "审批进行中";
    case "2":
      return "审批被撤回";
    case "3":
      return "审批被驳回";
    default:
      return "审批通过";
  }
});

// 获取状态对应的图片
const statusImage = computed(() => {
  switch (businessStatusText.value) {
    case "审批通过":
      return passImage;
    case "审批被驳回":
      return overruleImage;
    case "审批被撤回":
      return quashImage;
    default:
      return null; // 审批进行中不显示图片
  }
});

// 规范化 activityUser 数据(activityUser里面有时候直接是对象 有时候是数组里面包含对象)
const getActivityUsers = (activityUser) => {
  if (Array.isArray(activityUser)) {
    return activityUser;
  }
  return [activityUser];
};

// 计算时长
const timeLength = computed(() => {
  const dateTimeRangePickers = formConfig.value.components.filter(
    (component) => component.type === "DateTimeRangePicker"
  );

  console.log(dateTimeRangePickers);

  if (!dateTimeRangePickers.length) {
    return "未找到日期时间区间组件";
  }

  const dateTimeRangePicker = dateTimeRangePickers[0];
  const format = dateTimeRangePicker.props.format.replaceAll("dd", "DD");
  // 检查 dateTimeRangePicker.value 是否存在且包含两个元素
  if (!dateTimeRangePicker.value || dateTimeRangePicker.value.length < 2) {
    return "没有填写日期时间区间";
  }
  const start = moment(dateTimeRangePicker.value[0], format);
  const end = moment(dateTimeRangePicker.value[1], format);

  if (start.isSame(end)) {
    return "0 （时长为0，请确认）";
  }

  const duration = moment.duration(end.diff(start));
  const years = duration.years();
  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();

  return `${years > 0 ? years + "年 " : ""}${
    months > 0 ? months + "个月 " : ""
  }${days > 0 ? days + "天 " : ""}${hours > 0 ? hours + "小时 " : ""}${
    minutes > 0 ? minutes + "分钟" : ""
  }`.trim();
});
// 下载
const download = async (item) => {
  // console.log("item", item);
  const fileUrl = item.url;
  // console.log(fileUrl);
  ElMessageBox.confirm(`确定要下载【${item.name}】吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "success",
  }).then(async () => {
    // 使用 fetch API 下载文件
    const downloadResponse = await fetch(fileUrl);
    const blob = await downloadResponse.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.name;
    link.style.display = "none";
    document.body.appendChild(link);
    // 触发下载
    link.click();
    // 清理
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
    ElMessage.success("文件下载成功");
  });
};

// 打印模板
function showPrintFun(showP) {
  //清空数组
  print.value.printForm = [];
  print.value.printList = [];
  print.value.number = 1;

  showPrint.value = showP;

  print.value.title = props.processDefinitionName;
  print.value.id =
    InstanceRes.value.processNumber + "-" + InstanceRes.value.numberStatus;
  print.value.time = InstanceRes.value.progress[0].createTime;
  print.value.name = InstanceRes.value.progress[0].activityUser.name;
  print.value.printname = userStore.user.nickname;

  InstanceRes.value.formConfig.components.forEach((item) => {
    print.value.printForm.push({
      name: item.name,
      value: item.value,
    });
  });

  InstanceRes.value.progress.forEach((item) => {
    if (item.name == "审批人") {
      print.value.number++;
      print.value.printList.push({
        name: item.activityUser.name,
        time: item.endTime,
      });
    }
  });

  const currentTime = new Date();
  const formattedTime = `${currentTime.getFullYear()}-${(
    currentTime.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${currentTime
    .getDate()
    .toString()
    .padStart(2, "0")} ${currentTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${currentTime
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${currentTime.getSeconds().toString().padStart(2, "0")}`;

  console.log(formattedTime);
  print.value.printtime = formattedTime;
}

onMounted(() => {
  // 监听localDrawer的变化，当关闭时，通知父组件
});

// 当localDrawer变化时，通知父组件
const emit = defineEmits(["update:drawer"]);
watch(localDrawer, (newVal) => {
  emit("update:drawer", newVal);
  if (newVal) {
    // 当抽屉打开时才调用请求
    InstanceProcess();
  }
});
</script>
<style scoped>
/* 设置标题为白色 */
:deep(.el-drawer__header) {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  background-color: white;
}

/* 覆盖 el-drawer__body 的默认样式 */
:deep(.el-drawer__body) {
  padding: 20px 0; /* 你可以根据需要调整 padding 或移除其他默认样式 */
}

.drawer-header {
  display: flex;
  align-items: center;
  margin-top: -20px;
  background-color: #fff;
}

.drawer-user-name {
  margin-top: -10px;
  text-align: center;
}

.drawer-status {
  margin-left: 15px;
}

.drawer-status-title {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.drawer-status-title-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.drawer-status-desc {
  color: #a7a0a0;
}

.status-image {
  position: absolute;
  top: 80px;
  right: 100px;
  z-index: 9999;
  width: 80px;
  height: 80px;
}

.drawer-body,
.drawer-header {
  padding: 10px;
}

.drawer-body {
  margin: 10px 0;
  background-color: #fff;
}

.custom-timeline {
  padding: 10px;
  background-color: #fff;
}

.timeline {
  position: relative;
}

.timeline-item {
  position: relative;
  padding-left: 70px; /* Adjusted for avatar width and spacing */
  margin-bottom: 20px;
}

.timeline-avatar-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-avatar {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #dcdcdc;
}

.timeline-content {
  padding: 10px;
  margin-left: -15px;
  background-color: #fff;
  border: 1px solid #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-info {
  display: flex;
  flex-direction: column;
}

.timeline-title {
  margin-top: -5px;
  font-size: 16px;
  color: #726969;
}

.timeline-name {
  margin-top: -20px;
  font-size: 14px;
  color: #888;
}

.timeline-time {
  margin-top: -20px;
  font-size: 12px;
  color: #888;
}

.inner-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.inner-avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.inner-avatar {
  width: 30px;
  height: 30px;
}

.inner-avatar-name {
  margin-top: -1px;
  font-size: 12px;
  color: #333;
}

.commentBox,
.opcxBox {
  padding: 10px;
  background-color: #f1f1f1;
  border-radius: 8px;
}

.signBox {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.signature {
  width: 300px;
}

.comment-text,
.opinion-text {
  color: #333;
}

.attachment-list {
  margin-top: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.attachment-image {
  max-width: 100px;
  margin-right: 10px;
  cursor: pointer;
  object-fit: cover;
}

.timeline-line {
  position: absolute;
  top: 0;
  left: 24px;
  width: 2px;
  height: 100%;
  background-color: #e0e0e0;
}

.single-user-name {
  margin-top: -20px;
  font-size: 14px;
}

.downloadName {
  color: #007bff;
  cursor: pointer; /* 添加鼠标悬停时的手形指针 */
}

.button-container {
  display: flex;
  justify-content: flex-end; /* 右对齐按钮 */
  background-color: white; /* 设置白色背景 */
}

.button-item {
  margin: 10px;
}

.print {
  position: relative;
  width: 100%;
  padding: 20px 16px;
  font-family: "宋体", SimSun, serif;
}

.print .printTitle {
  text-align: center;
}

.print .printHeader {
  margin-bottom: 20px;
  font-size: 16px;
}

.print .printHeader > div {
  padding: 5px 0;
}

.printTable {
  width: 100%;
  font-size: 16px;
  border-collapse: collapse;

  /* padding: 2px; */
}

.printTable tr th,
.printTable tr td {
  padding: 5px 10px;
  text-align: left;
  border: 1px solid #464648;
}

.printTable th {
  background-color: #f2f2f2; /* 设置表头背景色 */
}

.td-title {
  width: 200px;
}

.baseInfo {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
}

.printFooter {
  margin-top: 20px;
  font-size: 16px;
}

.printFooter > div {
  display: inline-block;
  width: 50%;
}

.print-image {
  position: absolute;
  top: 80px;
  right: 100px;
  z-index: 9999;
  width: 80px;
  height: 80px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #e8e8e8 !important;
}

:deep(.el-drawer__footer) {
  padding: 0;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #e8e8e8 !important;
}
</style>
