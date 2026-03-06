<template>
  <div>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-descriptions title="工单详情" />
        </el-col>
        <el-col :span="18" class="card-content-right-aligned">
          <!-- 操作卡片 -->
          <!-- <el-card mt="-2" mb="-2"> -->
          <el-button
            v-if="
              ticketData?.list?.[0]?.status === 2 &&
              ticketData?.list?.[0]?.handlerName === userStore.user.nickname
            "
            type="primary"
            @click="handleAccept"
          >
            <i-ep-documentCopy />接受
          </el-button>
          <el-button
            v-if="
              (ticketData?.list?.[0]?.status === 1 &&
                ticketData?.list?.[0]?.requesterName ===
                  userStore.user.nickname) ||
              (ticketData?.list?.[0]?.status === 2 &&
                ticketData?.list?.[0]?.handlerName === userStore.user.nickname)
            "
            type="warning"
            @click="() => openDialog()"
          >
            <i-ep-edit />分配
          </el-button>
          <el-button
            v-if="
              ticketData?.list?.[0]?.status === 2 &&
              ticketData?.list?.[0]?.handlerName === userStore.user.nickname
            "
            type="danger"
            @click="handelRollback"
          >
            <i-ep-delete />拒单
          </el-button>
          <el-button
            v-if="
              ticketData?.list?.[0]?.status === 3 &&
              ticketData?.list?.[0]?.handlerName === userStore.user.nickname
            "
            type="success"
            @click="handelComplete"
          >
            <i-ep-delete />完成
          </el-button>
          <el-button
            v-if="
              (ticketData?.list?.[0]?.status === 2 &&
                ticketData?.list?.[0]?.requesterName ===
                  userStore.user.nickname) ||
              (ticketData?.list?.[0]?.status === 3 &&
                ticketData?.list?.[0]?.requesterName ===
                  userStore.user.nickname)
            "
            type="warning"
            @click="handleReminders(ticketData)"
            ><i-ep-loading />催单</el-button
          >
          <el-button
            v-if="
              (ticketData?.list?.[0]?.status === 1 &&
                ticketData?.list?.[0]?.requesterName ===
                  userStore.user.nickname) ||
              (ticketData?.list?.[0]?.status === 2 &&
                ticketData?.list?.[0]?.requesterName ===
                  userStore.user.nickname)
            "
            type="primary"
            @click="openDialog('ticket-form')"
            ><i-ep-edit />修改</el-button
          >
          <el-button
            v-if="
              (ticketData?.list?.[0]?.status === 1 &&
                ticketData?.list?.[0]?.requesterName ===
                  userStore.user.nickname) ||
              (ticketData?.list?.[0]?.status === 2 &&
                ticketData?.list?.[0]?.requesterName ===
                  userStore.user.nickname)
            "
            type="danger"
            @click="handleDelete"
            ><i-ep-delete />删除</el-button
          >
          <!-- </el-card> -->
        </el-col>
      </el-row>
      <!-- 修改弹框 -->
      <el-dialog
        v-if="dialog.type === 'ticket-form'"
        v-model="dialog.visible"
        :title="dialog.title"
        :width="dialog.width"
        append-to-body
        @close="closeDialog"
      >
        <el-form
          :model="formUpdate"
          :rules="rulesUpdate"
          ref="formRef"
          label-width="100px"
        >
          <el-form-item label="标题" prop="title">
            <el-input v-model="formUpdate.title" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="formUpdate.description" />
          </el-form-item>
          <el-form-item label="请求人" prop="requesterName">
            <el-select
              disabled
              v-model="formUpdate.requesterName"
              placeholder="请选择请求人"
              filterable
              clearable
              popper-append-to-body
              v-select-loadmore="onLoadmore"
              popper-class="single-select-loadmore"
            >
              <el-option
                v-for="item in userList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <Dict v-model="formUpdate.type" code="ticketsType" />
          </el-form-item>
          <el-form-item label="处理人" prop="handlerName">
            <el-select
              disabled
              v-model="formUpdate.handlerName"
              placeholder="请选择处理人"
              filterable
              clearable
              popper-append-to-body
              v-select-loadmore="onLoadmore"
              popper-class="single-select-loadmore"
            >
              <el-option
                v-for="item in userList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <Dict v-model="formUpdate.status" code="ticketsStatus" />
          </el-form-item>
          <el-form-item label="优先级" prop="priority">
            <Dict v-model="formUpdate.priority" code="ticketsPriority" />
          </el-form-item>
        </el-form>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </span>
      </el-dialog>
      <el-card mb="3">
        <div
          v-if="
            ticketData?.list?.[0]?.title !== undefined &&
            ticketData?.list?.[0]?.title !== ''
          "
        >
          <el-descriptions title="基础信息" :data="ticketData">
            <el-descriptions-item label="工单标题：">{{
              ticketData?.list[0].title
            }}</el-descriptions-item>
            <el-descriptions-item label="当前状态：">
              <!-- <el-tag v-if="ticketData?.list[0].status">
                {{ ticketData?.list[0].status }}
              </el-tag> -->
              <DictLabel
                v-model="ticketData.list[0].status"
                code="ticketsStatus"
              />

              <!-- <el-tag v-if="ticketData?.list[0].status === 1">未分配</el-tag>
              <el-tag v-else-if="ticketData?.list[0].status === 2"
                >未接单</el-tag
              >
              <el-tag v-else-if="ticketData?.list[0].status === 3"
                >处理中</el-tag
              >
              <el-tag v-else>已完成</el-tag> -->
            </el-descriptions-item>
            <el-descriptions-item label="优先级：">
              <template
                v-if="typeof ticketData?.list[0].priority !== 'undefined'"
              >
                <DictLabel
                  v-model="ticketData.list[0].priority"
                  code="ticketsPriority"
                />
              </template>
            </el-descriptions-item>
            <el-descriptions-item label="工单类型：">
              <DictLabel v-model="ticketData.list[0].type" code="ticketsType" />
            </el-descriptions-item>
            <el-descriptions-item label="创建时间：">{{
              formatDate(String(ticketData?.list[0].createTime))
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间：">{{
              formatDate(String(ticketData?.list[0].updateTime))
            }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions title="表单信息" :data="ticketData">
            <el-descriptions-item label="工单描述：">{{
              ticketData?.list[0].description
            }}</el-descriptions-item>
            <el-descriptions-item label="请求者：">
              {{ ticketData?.list[0].requesterName }}
            </el-descriptions-item>

            <el-descriptions-item label="当前处理人：">{{
              ticketData?.list[0].handlerName
            }}</el-descriptions-item>
            <el-descriptions-item label="解决方案记录：">{{
              ticketData?.list[0].resolution
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-else>
          <el-empty description="description" />
        </div>
      </el-card>

      <!-- <el-card> </el-card> -->
    </el-card>
    <el-card mt="3">
      <div class="scroll-container">
        <el-descriptions class="fixed-title" title="历史操作记录详情" />

        <div v-for="item in historyData.list" :key="item.id" mt="3" mb="3">
          <el-card class="history-card">
            <el-descriptions>
              <!-- <el-descriptions-item label="工单ID：">{{
                item.ticketId
              }}</el-descriptions-item> -->
              <el-descriptions-item label="	操作用户名：">{{
                item.userName
              }}</el-descriptions-item>
              <el-descriptions-item label="操作类型：">
                <DictLabel v-model="item.action" code="ticketsActionType" />
              </el-descriptions-item>
              <el-descriptions-item label="操作时间：">{{
                item.actionTime
              }}</el-descriptions-item>
              <el-descriptions-item label="操作描述：">{{
                item.remark
              }}</el-descriptions-item>
            </el-descriptions>
            <el-button
              v-if="item.action === 2"
              type="primary"
              class="assignment-button"
              @click="() => openDialog('ticketHistoryId', item.id)"
            >
              分配记录详情
            </el-button>
          </el-card>
        </div>
      </div>
      <el-dialog
        v-if="dialog.type === 'ticketHistoryId'"
        v-model="dialog.visible"
        :title="dialog.title"
        :width="dialog.width"
        append-to-body
        @close="closeDialog"
      >
        <el-descriptions
          v-if="dialog.type === 'ticketHistoryId' && dialog.assignmentDetails"
        >
          <!-- <el-descriptions-item label="工单ID：">{{
            dialog.assignmentDetails.ticketId
          }}</el-descriptions-item> -->
          <!-- <el-descriptions-item label="分配者ID：">{{
            dialog.assignmentDetails.assignerId
          }}</el-descriptions-item> -->
          <el-descriptions-item label="分配者姓名：">{{
            dialog.assignmentDetails.assignerName
          }}</el-descriptions-item>
          <!-- <el-descriptions-item label="被分配者ID：">{{
            dialog.assignmentDetails.assignedToId
          }}</el-descriptions-item> -->
          <el-descriptions-item label="被分配者姓名：">{{
            dialog.assignmentDetails.assignedToName
          }}</el-descriptions-item>
          <el-descriptions-item label="分配时间：">{{
            dialog.assignmentDetails.assignmentTime
          }}</el-descriptions-item>
          <el-descriptions-item label="分配原因：">{{
            dialog.assignmentDetails.assignmentReason
          }}</el-descriptions-item>
        </el-descriptions>
        <!-- 弹窗底部操作按钮 -->
        <div class="dialog-footer">
          <el-button type="primary" @click="closeDialog">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </el-dialog>
    </el-card>
    <!-- 分配弹窗 -->
    <el-dialog
      v-if="dialog.type !== 'ticketHistoryId'"
      v-model="dialog.visible"
      :title="dialog.title"
      :width="dialog.width"
      append-to-body
      @close="closeDialog"
    >
      <el-form :model="form" label-width="120px" ref="ruleFormRef">
        <!-- 所属部门 -->
        <el-form-item label="选择部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            placeholder="请选择所属部门"
            :data="deptList"
            filterable
            clearable
            check-strictly
            :render-after-expand="false"
            @change="changeDept"
          />
        </el-form-item>

        <!-- 选择用户 -->
        <el-form-item label="选择用户" prop="assignedToId">
          <el-select
            v-model="form.assignedToId"
            placeholder="请选择用户"
            filterable
            clearable
            popper-append-to-body
            v-select-loadmore="onLoadmore"
            popper-class="single-select-loadmore"
          >
            <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- 分配原因 -->
        <el-form-item label="分配原因" prop="assignmentReason">
          <el-input
            v-model="form.assignmentReason"
            placeholder="请输入分配原因"
          />
        </el-form-item>
        <!-- 弹窗底部操作按钮 -->
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit(ruleFormRef)"
            >确 定</el-button
          >
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 滑块验证 -->
    <Vcode
      :zIndex="9999"
      :show="isShow"
      @success="onSuccess"
      @close="onClose"
    />
  </div>
</template>
<script setup lang="ts">
import TicketAPI from "@/api/workorder";
import TicketsAPI from "@/api/tickets";
import DeptAPI from "@/api/dept";
import DictAPI from "@/api/dict";
import { useUserStore } from "@/store/modules/user";
import { useCurrentIdStore } from "@/store/modules/currentTicketId";
import { useNotificationStore } from "@/store/modules/useNotificationStore";
const userStore = useUserStore();
const currentIdStore = useCurrentIdStore();
import { useRoute, useRouter } from "vue-router";
import { UserQuery, UserPageVO } from "@/api/user/model";
import UserAPI from "@/api/user";
import type { FormInstance } from "element-plus";
// 滑块验证码插件
import Vcode from "vue3-puzzle-vcode";

// 控制滑块验证码显示
const isShow = ref(false);

const onClose = () => {
  isShow.value = false;
};

let onSuccess = () => {};

const notificationStore = useNotificationStore();
const isDialogVisible = ref(false);
const assignmentDetails = ref({});
const ruleFormRef = ref<FormInstance>();
const deptList = ref<OptionType[]>(); // 部门下拉数据源
const route = useRoute();
const router = useRouter();
const Id = route.query.id;
const currentId = Number(Id);
const detailId = ref<number | null>(Number(route.query.id)); // 用 ref 存储 id
const statusList = ref<OptionType[]>();
const typeList = ref<OptionType[]>();
const priorityList = ref<OptionType[]>();
import { useTicketStore } from "@/store/modules/tickets";
const { ticketData, historyData } = useTicketStore();
const userList = ref<Array<{ value: string | number; label: string }>>([]);
import { AssignReq, HistoryPageReq, UpdateReq } from "@/api/tickets/model";
const formRef = ref();
const lastReminderTime = ref<{ [key: number]: number }>({});
const formUpdate = ref<UpdateReq>({
  id: 0,
  title: "",
  description: "",
  // requesterId: "",
  requesterName: "",
  type: 0,
  // handlerId: "",
  handlerName: "",
  resolution: "",
  status: "",
  priority: "",
  createTime: "",
  updateTime: "",
});
const rulesUpdate = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  description: [{ required: true, message: "请输入描述", trigger: "blur" }],
  type: [{ required: true, message: "请输入类型", trigger: "blur" }],
  priority: [{ required: true, message: "请输入优先级", trigger: "blur" }],
  createTime: [{ required: true, message: "请输入创建时间", trigger: "blur" }],
  updateTime: [{ required: true, message: "请输入更新时间", trigger: "blur" }],
};
const form = reactive({
  ticketId: currentId,
  deptId: 1,
  assignedToId: "",
  assignmentReason: "",
});
interface AssignmentDetails {
  id: number;
  ticketId: number;
  assignerId: number;
  assignerName: string;
  assignedToId: string;
  assignedToName: string;
  assignmentTime: string;
  assignmentReason: string;
}
// 弹窗对象
const dialog = reactive({
  visible: false,
  width: 800,
  title: "",
  type: "" as string,
  assignmentDetails: null as AssignmentDetails | null,
});
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
});
const total = ref(0);
/** 加载部门下拉数据源 */
async function loadDeptOptions() {
  // 获取部门下拉列表
  deptList.value = await DeptAPI.getOptions();
}

/** 当所选部门更改时，重新加载所选部门下的用户列表 */
async function changeDept() {
  const selectedDeptId = form.deptId;
  if (selectedDeptId) {
    // 清除之前的用户选择
    form.assignedToId = "";
    // 重新加载用户列表
    userList.value = [];
    handleQuery();
  }
}
// 监听下拉框的滚动事件
const onLoadmore = () => {
  queryParams.pageNum++;
  if (userList.value.length >= total.value) {
    return;
  }
  handleQuery();
};
// 获取用户数据
const handleQuery = () => {
  if (!form.deptId) return; // 如果没有选择部门，则不查询用户
  const deptId = form.deptId;
  UserAPI.getUserByDept(deptId).then((data: any) => {
    userList.value = data.map((user: UserPageVO) => ({
      value: user.id !== undefined ? user.id : "undefined",
      label: user.nickname !== undefined ? user.nickname : "undefined",
    }));
  });
};

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

// /** 获取字典选项 */
// function getstatusList() {
//   DictAPI.getDictOptions("ticketsStatus").then((data) => {
//     statusList.value = data;
//   });
// }
// function gettypeList() {
//   DictAPI.getDictOptions("ticketsType").then((data) => {
//     typeList.value = data;
//   });
// }

// function getpriorityList() {
//   DictAPI.getDictOptions("ticketsPriority").then((data) => {
//     priorityList.value = data;
//   });
// }
const isLoading = ref(false);
let previousId: number | null = null;
const byId = async (id: number) => {
  await TicketAPI.getDetail(id).then((detail: any) => {
    ticketData.value = { list: [detail], total: 1 };
    previousId = id;
  });
};

// 监听 route.query.id 的变化
watch(
  () => route.query.id,
  async (newId, oldId) => {
    if (newId !== oldId && newId !== undefined) {
      detailId.value = Number(newId);
      await byId(detailId.value); // 重新获取详情
      // console.log("ID 已更新:", detailId.value);
    }
  },
  { immediate: true } // 立即执行一次，确保在组件加载时就获取数据
);

// 接受
function handleAccept() {
  console.log(currentId);
  ElMessageBox.confirm("确认接受此工单?", "确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "success",
  }).then(() => {
    // 显示滑块验证
    isShow.value = true;
    // 滑块验证成功后的回调
    onSuccess = async () => {
      await TicketsAPI.AcceptData(currentId);
      ElMessage.success("成功接受");
      byId(currentId);
      handelHistoryPage(currentId);
      // 更新 lastUpdated，触发订阅者获取最新数据
      notificationStore.updateLastUpdated();
      onClose();
    };
  });
}
// 回退
const handelRollback = async () => {
  // 显示确认对话框
  await ElMessageBox.confirm("确定要回退吗？", "确认回退", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
  // 显示输入对话框以输入回退原因
  const { value: reason } = await ElMessageBox.prompt(
    "请输入回退原因",
    "回退原因",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPattern: /.+/,
      inputErrorMessage: "回退原因不能为空",
    }
  );
  // 显示滑块验证
  isShow.value = true;
  onSuccess = async () => {
    // 向服务器发送回退请求
    await TicketsAPI.RollbackData(currentId, reason);
    ElMessage.success("回退成功");
    byId(currentId);
    handelHistoryPage(currentId);
    onClose();
  };
};
// 完成
const handelComplete = async () => {
  // 显示输入对话框以输入解决方法
  const { value: resolution } = await ElMessageBox.prompt(
    "请输入解决方法",
    "解决方法",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPattern: /.+/,
      inputErrorMessage: "解决方法不能为空",
    }
  );

  // 确认完成
  await ElMessageBox.confirm(
    `确定要完成此操作吗？\n解决方法：${resolution}`,
    "确认完成",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  );

  // 确保 currentId 有值
  if (currentId !== null) {
    // 显示滑块验证
    isShow.value = true;
    onSuccess = async () => {
      // 向服务器发送完成请求
      await TicketsAPI.CompleteData(currentId, resolution);
      ElMessage.success("完成成功");
      byId(currentId);
      handelHistoryPage(currentId);
      // 更新 lastUpdated，触发订阅者获取最新数据
      notificationStore.updateLastUpdated();
      onClose();
    };
  }
};
// 催单
const handleReminders = (ticketData: any) => {
  const currentTime = new Date().getTime();
  const currentStatus = ticketData?.list[0]?.status;
  if (
    lastReminderTime.value[currentId] &&
    currentTime - lastReminderTime.value[currentId] < 60000
  ) {
    ElMessage.warning("请稍等一分钟后再进行催单操作");
    return;
  }
  let message;
  if (currentStatus === 2) {
    message = "是否催促处理人尽快接受此工单?";
  } else {
    message = "是否催促处理人尽快完成此工单?";
  }
  ElMessageBox.confirm(message, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 显示滑块验证
    isShow.value = true;
    // 滑块验证成功后的回调
    onSuccess = async () => {
      TicketsAPI.RemindersData(currentId);
      lastReminderTime.value[currentId] = currentTime; // 更新最后一次催单时间
      ElMessage.warning("已发送催单通知给处理人");
      byId(currentId);
      handelHistoryPage(currentId);
      // 更新 lastUpdated，触发订阅者获取最新数据
      notificationStore.updateLastUpdated();
      onClose();
    };
  });
};
// 修改表单提交
const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      isShow.value = true;
      // 调用验证码成功的回调
      onSuccess = async () => {
        const { updateTime, createTime, ...updateDataWithoutTitle } =
          formUpdate.value;
        await TicketsAPI.UpdateData(updateDataWithoutTitle);
        ElMessage.success("更新成功");
        closeDialog();
        byId(currentId);
        handelHistoryPage(currentId);
        onClose();
      };
    }
  });
};
//删除
function handleDelete() {
  ElMessageBox.confirm("确定要删除此工单吗？", "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 显示滑块验证
    isShow.value = true;
    // 滑块验证成功后的回调
    onSuccess = async () => {
      await TicketsAPI.DeleteData(currentId.toString());
      ElMessage.success("删除成功");
      router.push("/workorder/myCreate");
      onClose();
    };
  });
}
// 工单操作记录详情分页列表
const handelHistoryPage = async (currentId: number) => {
  try {
    isLoading.value = true; // 显示加载状态
    const ticketIdStr = currentId.toString();
    const queryParams: HistoryPageReq = {
      ticketId: ticketIdStr,
      pageNum: "1",
      pageSize: "10",
    };
    const resp = await TicketsAPI.HistoryPageData(queryParams);
    historyData.value = resp;
    previousId = currentId;
  } catch (error) {
    console.log("Error fetching history data:", error);
  } finally {
    isLoading.value = false; // 隐藏加载状态
  }
};

// 弹窗  打开
const openDialog = async (type = "defaultType", id = 0) => {
  if (type === "ticketHistoryId") {
    dialog.title = "分配记录详情";
    await TicketsAPI.TicketHistoryIdData(id).then((resp: any) => {
      dialog.assignmentDetails = resp;
      console.log(dialog.assignmentDetails);
    });
  } else if (type === "ticket-form") {
    dialog.title = "工单修改";
    if (currentId) {
      TicketAPI.getDetail(currentId).then((data) => {
        Object.assign(formUpdate.value, { ...data });
      });
    }
  } else {
    dialog.title = "工单分配";
    // 处理其他类型的逻辑
  }
  dialog.type = type;
  dialog.visible = true;
};
// 弹窗 关闭
async function closeDialog() {
  dialog.visible = false;
}
// 重置分配弹窗表单数据
const resetForm = () => {
  form.ticketId = 0;
  form.deptId = 1;
  form.assignedToId = "";
  form.assignmentReason = "";
};
// 弹框 确定
const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid && currentId !== null) {
      // 显示滑块验证
      isShow.value = true;
      // 滑块验证成功后的回调
      onSuccess = async () => {
        const requestData: AssignReq = {
          ticketId: currentId,
          deptId: form.deptId,
          assignedToId: form.assignedToId,
          assignmentReason: form.assignmentReason,
        };
        await TicketsAPI.AssignData(requestData);
        ElMessage.success("分配成功");
        resetForm();
        byId(currentId);
        handelHistoryPage(currentId);
        closeDialog();
        // 更新 lastUpdated，触发订阅者获取最新数据
        notificationStore.updateLastUpdated();
        onClose();
      };
    }
  });
};
onMounted(async () => {
  // getstatusList();
  // gettypeList();
  // getpriorityList();
  handleQuery();
  loadDeptOptions();
});
onBeforeMount(() => {
  const currentId = Number(route.query.id);
  if (!isNaN(currentId) && currentId !== previousId && !isLoading.value) {
    previousId = currentId;
    // console.log("Updated Previous Id:", previousId);
    isLoading.value = true;
    // 异步获取工单数据和操作历史记录
    byId(currentId)
      .then(() => {
        return handelHistoryPage(currentId);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        router.push("/workorder/ticketAll");
      })
      .finally(() => {
        isLoading.value = false;
      });
  } else {
    router.push("/workorder/ticketAll");
  }
  // getstatusList();
  // gettypeList();
  // getpriorityList();
});
</script>
<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.scroll-container {
  max-height: 380px;
  margin-top: 20px;
  overflow-y: scroll;

  /* 隐藏滚动条 */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, and Opera */
}

.fixed-title {
  position: sticky;
  top: 0;
  z-index: 1;
  padding-bottom: 10px;
  background-color: white;
}

.scroll-content {
  margin-top: 3px; /* 添加一些间距，确保滚动内容不会与标题重叠 */
}

.history-card {
  position: relative;
}

.assignment-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.card-content-right-aligned {
  text-align: right; /* 操作卡片右对齐 */
}
</style>
