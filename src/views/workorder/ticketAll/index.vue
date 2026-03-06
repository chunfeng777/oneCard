<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="search">
      <!-- 工单标题搜索 -->
      <el-input
        class="s_input"
        placeholder="请输入工单标题"
        v-model="queryParams.keywords"
      />
      <!-- 优先级下拉框 -->
      <Dict
        v-model="queryParams.priority"
        placeholder="选择优先级"
        code="ticketsPriority"
      />
      <!-- <el-select
        v-model="queryParams.priority"
        placeholder="选择优先级"
        class="s_input"
      >
        <el-option
          v-for="(item, index) in priorityOptions"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select> -->

      <!-- 类型下拉框 -->
      <Dict
        v-model="queryParams.type"
        placeholder="选择类型"
        code="ticketsType"
      />

      <!-- <el-select
        v-model="queryParams.type"
        placeholder="选择类型"
        class="s_input"
      >
        <el-option
          v-for="(item, index) in typeOptions"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select> -->
      <el-button @click="handleSearch" type="primary"
        ><i-ep-Search />搜索</el-button
      >
      <el-button @click="handleAll" type="primary"
        ><i-ep-Refresh />重置</el-button
      >
    </div>
    <el-row :gutter="20">
      <!-- 用户列表 -->
      <el-col :lg="24" :xs="24">
        <el-card shadow="never" class="table-container">
          <template #header>
            <div class="flex justify-between"></div>
          </template>

          <el-table
            v-loading="loading"
            :data="pageData"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              key="id"
              label="编号ID"
              align="center"
              prop="id"
              width="120"
            />
            <el-table-column
              label="标题"
              align="center"
              prop="title"
              width="240"
            />

            <el-table-column label="当前状态" width="120" align="center">
              <template #default="scope">
                <DictLabel v-model="scope.row.status" code="ticketsStatus" />
              </template>
            </el-table-column>

            <el-table-column
              label="	发起人"
              width="120"
              align="center"
              prop="requesterName"
            />

            <el-table-column label="类型" width="120" align="center">
              <template #default="scope">
                <DictLabel v-model="scope.row.type" code="ticketsType" />
              </template>
            </el-table-column>

            <el-table-column label="优先级" align="center" width="120">
              <template #default="scope">
                <DictLabel
                  v-model="scope.row.priority"
                  code="ticketsPriority"
                />
              </template>
            </el-table-column>

            <el-table-column
              label="处理人"
              align="center"
              prop="handlerName"
              width="120"
            />

            <!-- <el-table-column
              label="处理人部门"
              align="center"
              prop="deptName"
              width="120"
            /> -->
            <el-table-column
              label="创建时间"
              align="center"
              prop="createTime"
              width="180"
            />
            <el-table-column :label="$t('user.operate')" fixed="right">
              <template #default="scope">
                <el-button
                  v-hasPerm="['wor:ticketAll:reception']"
                  type="success"
                  link
                  size="small"
                  v-if="
                    scope.row.status === 2 &&
                    scope.row.handlerName === userStore.user.nickname
                  "
                  @click="handleAccept(scope.row.id)"
                  ><i-ep-notification />接受</el-button
                >
                <el-button
                  v-hasPerm="['wor:ticketAll:assignment']"
                  type="warning"
                  link
                  size="small"
                  v-if="scope.row.status === 1"
                  @click="handleAssign(scope.row.id)"
                  ><i-ep-switch />分配</el-button
                >
                <el-button
                  v-hasPerm="['wor:ticketAll:fallback']"
                  type="danger"
                  link
                  size="small"
                  v-if="
                    scope.row.status === 2 &&
                    scope.row.handlerName === userStore.user.nickname
                  "
                  @click="handelRollback(scope.row.id)"
                  ><i-ep-close />回退</el-button
                >
                <el-button
                  v-hasPerm="['wor:ticketAll:finish']"
                  type="success"
                  link
                  size="small"
                  v-if="
                    scope.row.status === 3 &&
                    scope.row.handlerName === userStore.user.nickname
                  "
                  @click="handelComplete(scope.row.id)"
                  ><i-ep-folderChecked />完成</el-button
                >

                <el-button
                  v-hasPerm="['wor:ticketAll:detail']"
                  type="primary"
                  link
                  size="small"
                  @click="handleDeal(scope.row.id)"
                  ><i-ep-documentCopy />处理详情</el-button
                >

                <el-button
                  v-hasPerm="['wor:ticketAll:edit']"
                  type="primary"
                  link
                  size="small"
                  v-if="
                    parseInt(scope.row.status) === 1 ||
                    parseInt(scope.row.status) === 2
                  "
                  @click="openDialog('ticket-form', scope.row.id)"
                  ><i-ep-edit />修改</el-button
                >
                <el-button
                  v-hasPerm="['wor:ticketAll:delete']"
                  type="danger"
                  link
                  size="small"
                  v-if="
                    parseInt(scope.row.status) === 1 ||
                    parseInt(scope.row.status) === 2
                  "
                  @click="handleDelete(scope.row.id)"
                  ><i-ep-delete />删除</el-button
                >
                <el-button
                  v-hasPerm="['wor:ticketAll:reminders']"
                  type="warning"
                  link
                  size="small"
                  v-if="
                    (scope.row.requesterName === userStore.user.nickname &&
                      parseInt(scope.row.status) === 2) ||
                    parseInt(scope.row.status) === 3
                  "
                  @click="
                    handleReminders(scope.row.id, parseInt(scope.row.status))
                  "
                  ><i-ep-loading />催单</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <!-- <pagination
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="subProcessing"
          />
          <pagination
            v-if="total > 0 && ticketBtn.create"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="subCreate"
          /> -->
          <pagination
            v-model:total="tot"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="subAll"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 分配 -->
    <el-dialog
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
          <el-button type="primary" @click="handSubmit(ruleFormRef)"
            >确 定</el-button
          >
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 弹窗 -->
    <el-dialog
      v-if="dialog.type === 'user-form'"
      v-model="dialog.visible"
      :title="dialog.title"
      :width="dialog.width"
      append-to-body
      @close="closeDialog"
    >
      <!-- 用户新增/编辑表单 -->
      <!-- <el-form
        v-if="dialog.type === 'user-form'"
        ref="userFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item :label="$t('user.username')" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            :placeholder="$t('user.message.username.required')"
          />
        </el-form-item>

        <el-form-item :label="$t('user.nickname')" prop="nickname">
          <el-input
            v-model="formData.nickname"
            :placeholder="$t('user.message.nickname.required')"
          />
        </el-form-item>

        <el-form-item :label="$t('user.gender')" prop="gender">
          <dictionary
            :placeholder="$t('user.message.pleaseSelect.required')"
            v-model="formData.gender"
            type-code="gender"
          />
        </el-form-item>

        <el-form-item :label="$t('user.role')" prop="roleIds">
          <el-select
            v-model="formData.roleIds"
            multiple
            :placeholder="$t('user.message.pleaseSelect.required')"
          >
            <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('user.tel')" prop="mobile">
          <el-input
            v-model="formData.mobile"
            :placeholder="$t('user.message.tel.required')"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item :label="$t('user.email')" prop="email">
          <el-input
            v-model="formData.email"
            :placeholder="$t('user.message.email.required')"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item :label="$t('user.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">{{ $t("user.normal") }}</el-radio>
            <el-radio :label="0">{{ $t("user.disable") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form> -->

      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{
            $t("user.confirm")
          }}</el-button>
          <el-button @click="closeDialog">{{ $t("user.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>
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
          <Dict v-model="formUpdate.status" code="ticketsStatus" disabled />
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
defineOptions({
  name: "Workorder",
  inheritAttrs: false,
});
import { useTicketStore } from "@/store/modules/tickets";
import { useNotificationStore } from "@/store/modules/useNotificationStore";
const { ticketData } = useTicketStore();
import TicketAPI from "@/api/workorder";
import UserAPI from "@/api/user";
import DictAPI from "@/api/dict";
// 滑块验证码插件
import Vcode from "vue3-puzzle-vcode";

import { UserForm, TicketQuery, TicketPageVO } from "@/api/workorder/model";
import router from "@/router";
import TicketsAPI from "@/api/tickets";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import type { FormInstance } from "element-plus";
const notificationStore = useNotificationStore();
const formRef = ref();
const userStore = useUserStore();
const { t } = useI18n();
const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单
// 控制滑块验证码显示
const isShow = ref(false);

const onClose = () => {
  isShow.value = false;
};

let onSuccess = () => {};

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<TicketQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
  priority: "",
  type: "",
});

// // 优先级选项
// const priorityOptions = [
//   { label: "高", value: 3 },
//   { label: "中", value: 2 },
//   { label: "低", value: 1 },
//   { label: "紧急", value: 4 },
// ];
// // 类型选项
// const typeOptions = [
//   { label: "常规", value: 1 },
//   { label: "技术", value: 2 },
//   { label: "人事", value: 3 },
//   { label: "其他", value: 4 },
// ];

const Params = reactive<TicketQuery>({
  pageNum: 1,
  pageSize: 10,
});
const dateTimeRange = ref("");
const total = ref(0); // 数据总数
const tot = ref(0); // 数据总数
const pageData = ref<TicketPageVO[]>(); // 用户分页数据
const deptList = ref<OptionType[]>(); // 部门下拉数据源
const roleList = ref<OptionType[]>(); // 角色下拉数据源
const userList = ref<Array<{ value: string | number; label: string }>>([]);
import { UserPageVO } from "@/api/user/model";
const ruleFormRef = ref<FormInstance>();
import DeptAPI from "@/api/dept";
const statusList = ref<OptionType[]>();
const typeList = ref<OptionType[]>();
const priorityList = ref<OptionType[]>();
const lastReminderTime = ref<{ [key: number]: number }>({});
const disposeOrderArr = ["rollback", "assign", "accept"];
const disposeProcessArr = ["rollback", "complete"];
import { AssignReq, HistoryPageReq, UpdateReq } from "@/api/tickets/model";

// 存储当前操作的 ticketId
const currentTicketId = ref<number | null>(null);
const form = reactive({
  ticketId: 0,
  deptId: 1,
  assignedToId: "",
  assignmentReason: "",
  managerId: undefined, // 初始化 managerId 为 undefined
});
watch(dateTimeRange, (newVal) => {
  if (newVal) {
    queryParams.startTime = newVal[0];
    queryParams.endTime = newVal[1];
  }
});

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  subAll();
};

// 重置分配弹窗表单数据
const resetForm = () => {
  form.ticketId = 0;
  form.deptId = 1;
  form.assignedToId = "";
  form.assignmentReason = "";
};

// 重置（清空所有数据）
const handleAll = () => {
  pageData.value = [];
  queryParams.keywords = "";
  queryParams.priority = "";
  queryParams.type = "";
  subAll();
};

// const ticketBtn = reactive({
//   processing: true,
//   create: false,
//   all: false,
// });

// 弹窗对象
const dialog = reactive({
  visible: false,
  type: "",
  width: 800,
  title: "",
});

// 用户表单数据
const formData = reactive<UserForm>({
  status: 1,
});

// 用户导入数据
const importData = reactive({
  deptId: undefined,
  file: undefined,
  fileList: [],
});

// 获取用户数据
const handQuery = () => {
  if (!form.deptId) return; // 如果没有选择部门，则不查询用户
  const deptId = form.deptId;
  UserAPI.getUserByDept(deptId).then((data: any) => {
    userList.value = data.map((user: UserPageVO) => ({
      value: user.id !== undefined ? user.id : "undefined",
      label: user.nickname !== undefined ? user.nickname : "undefined",
    }));
  });
};
function getUserById(id: number | string | undefined): string {
  if (!id) return ""; // 处理未定义的情况
  const user = userList.value.find((user) => user.value === id);
  return user ? user.label : "";
}
const handleAccept = (id: number) => {
  ElMessageBox.confirm("确认接受此工单?", "确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "success",
  }).then(() => {
    // 显示滑块验证
    isShow.value = true;
    // 滑块验证成功后的回调
    onSuccess = async () => {
      await TicketsAPI.AcceptData(id);
      ElMessage.success("成功接受工单");
      // subProcessing();
      // subCreate();
      subAll();
      // 更新 lastUpdated，触发订阅者获取最新数据
      notificationStore.updateLastUpdated();
      onClose();
    };
  });
};
const handelRollback = async (id: number) => {
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
  // 滑块验证成功后的回调
  onSuccess = async () => {
    // 向服务器发送回退请求
    await TicketsAPI.RollbackData(id, reason);
    ElMessage.success("回退成功");
    subAll();
    onClose();
  };
};
const handelComplete = async (id: number) => {
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
  if (id !== null) {
    // 显示滑块验证
    isShow.value = true;
    // 滑块验证成功后的回调
    onSuccess = async () => {
      // 向服务器发送完成请求
      await TicketsAPI.CompleteData(id, resolution);
      ElMessage.success("完成成功");
      subAll();
      // 更新 lastUpdated，触发订阅者获取最新数据
      notificationStore.updateLastUpdated();
      onClose();
    };
  }
};
async function handleAssign(id?: number) {
  currentTicketId.value = id !== undefined ? id : null;
  openDialog();
}
// 弹框 确定
const handSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid && currentTicketId.value !== null) {
      // 显示滑块验证
      isShow.value = true;
      // 滑块验证成功后的回调
      onSuccess = async () => {
        const requestData: AssignReq = {
          ticketId: currentTicketId.value!,
          deptId: form.deptId,
          assignedToId: form.assignedToId,
          assignmentReason: form.assignmentReason,
        };
        await TicketsAPI.AssignData(requestData);
        ElMessage.success("分配成功");
        subAll();
        closeDialog();
        resetForm();
        // 更新 lastUpdated，触发订阅者获取最新数据
        notificationStore.updateLastUpdated();
        onClose();
      };
    }
  });
};
// 催单
const handleReminders = (id: number, status: number) => {
  const currentTime = new Date().getTime();
  if (
    lastReminderTime.value[id] &&
    currentTime - lastReminderTime.value[id] < 60000
  ) {
    ElMessage.warning("请稍等一分钟后再进行催单操作");
    return;
  }
  const message =
    status === 2
      ? "是否催促处理人尽快接受此工单?"
      : "是否催促处理人尽快完成此工单?";

  ElMessageBox.confirm(message, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 显示滑块验证
    isShow.value = true;
    // 滑块验证成功后的回调
    onSuccess = async () => {
      await TicketsAPI.RemindersData(id);
      lastReminderTime.value[id] = currentTime; // 更新最后一次催单时间
      ElMessage.warning("已发送催单通知给处理人");
      subAll();
      // 更新 lastUpdated，触发订阅者获取最新数据
      notificationStore.updateLastUpdated();
      onClose();
    };
  });
};
// 监听下拉框的滚动事件
const onLoadmore = () => {
  Params.pageNum++;
  if (userList.value.length >= total.value) {
    return;
  }
  handQuery();
};
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
    handQuery();
  }
}

const formUpdate = ref<UpdateReq>({
  id: 0,
  title: "",
  description: "",
  // requesterId: 0,
  type: 0,
  // handlerId: 0,
  resolution: "",
  status: "",
  priority: "",
  createTime: "",
  updateTime: "",
  requesterName: "",
  handlerName: "",
});

const rulesUpdate = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  description: [{ required: true, message: "请输入描述", trigger: "blur" }],
  // requesterId: [{ required: true, message: "请输入请求人ID", trigger: "blur" }],
  type: [{ required: true, message: "请输入类型", trigger: "blur" }],
  // handlerId: [{ required: true, message: "请输入处理人ID", trigger: "blur" }],
  // resolution: [{ required: true, message: "请输入解决方案", trigger: "blur" }],
  // status: [{ required: true, message: "请输入状态", trigger: "blur" }],
  priority: [{ required: true, message: "请输入优先级", trigger: "blur" }],
  createTime: [{ required: true, message: "请输入创建时间", trigger: "blur" }],
  updateTime: [{ required: true, message: "请输入更新时间", trigger: "blur" }],
};
// 时间转换

// 校验规则
const rules = reactive({
  username: [
    {
      required: true,
      message: t("user.message.rules.username"),
      trigger: "blur",
    },
  ],
  nickname: [
    {
      required: true,
      message: t("user.message.rules.nickname"),
      trigger: "blur",
    },
  ],
  deptId: [
    {
      required: true,
      message: t("user.message.rules.deptId"),
      trigger: "blur",
    },
  ],
  roleIds: [
    {
      required: true,
      message: t("user.message.rules.roleIds"),
      trigger: "blur",
    },
  ],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: t("user.message.rules.email"),
      trigger: "blur",
    },
  ],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t("user.message.rules.tel"),
      trigger: "blur",
    },
  ],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  UserAPI.getPage(queryParams)
    .then((data) => {
      // console.log("handleQuery", data);
      pageData.value = data.list as TicketPageVO[];
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}
/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  dateTimeRange.value = "";
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.startTime = undefined;
  queryParams.endTime = undefined;
  handleQuery();
}

async function subAll() {
  loading.value = true;
  TicketAPI.getPage(queryParams)
    .then((res) => {
      pageData.value = res.list;
      tot.value = res.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 获取字典选项 */
// async function getstatusList() {
//   DictAPI.getDictOptions("ticketsStatus").then((data) => {
//     statusList.value = data;
//   });
// }

// async function gettypeList() {
//   DictAPI.getDictOptions("ticketsType").then((data) => {
//     typeList.value = data;
//   });
// }

// async function getpriorityList() {
//   DictAPI.getDictOptions("ticketsPriority").then((data) => {
//     priorityList.value = data;
//   });
// }

// // 字典数值转换
// function dictPage() {
//   if (pageData.value) {
//     pageData.value.forEach((item) => {
//       item.statusList = statusList.value;
//       item.typeList = typeList.value;
//       item.priorityList = priorityList.value;
//     });
//   }
// }

/** 行选中 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}
/**
 * 打开弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 * @param id 用户ID
 */
async function openDialog(type?: string, id?: number) {
  dialog.visible = true;
  dialog.type = type!;
  if (dialog.type === "user-form") {
    // 用户表单弹窗
    // await loadDeptOptions();
    if (id) {
      dialog.title = t("user.message.userForm.modifyUser");
      UserAPI.getFormData(id).then((data) => {
        Object.assign(formData, { ...data });
      });
    } else {
      dialog.title = t("user.message.userForm.addUser");
    }
  } else if (dialog.type === "ticket-form") {
    dialog.title = "工单修改";
    if (id) {
      TicketAPI.getDetail(id).then((data) => {
        Object.assign(formUpdate.value, { ...data });
      });
    }
  }
  // else if (dialog.type === "ticket-details") {
  //   dialog.title = "工单详情";
  //   if (id) {
  //   }
  // }
  else {
    form.ticketId = currentTicketId.value ?? 0;
    console.log(form.ticketId);
    dialog.title = "工单分配";
  }
}
// 修改表单提交
const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 显示验证码组件
      isShow.value = true;
      // 调用验证码成功的回调
      onSuccess = async () => {
        const { updateTime, createTime, ...updateDataWithoutTitle } =
          formUpdate.value;
        await TicketsAPI.UpdateData(updateDataWithoutTitle);
        ElMessage.success("更新成功");
        closeDialog();
        subAll();
        onClose();
      };
    }
  });
};
/**
 * 关闭弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 */
function closeDialog() {
  dialog.visible = false;
  if (dialog.type === "user-form") {
    userFormRef.value.resetFields();
    userFormRef.value.clearValidate();

    formData.id = undefined;
    formData.status = 1;
  } else if (dialog.type === "user-import") {
    importData.file = undefined;
    importData.fileList = [];
  }
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  if (dialog.type === "user-form") {
    userFormRef.value.validate((valid: any) => {
      if (valid) {
        const userId = formData.id;
        loading.value = true;
        if (userId) {
          UserAPI.update(userId, formData)
            .then(() => {
              ElMessage.success(t("user.message.userForm.modification"));
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        } else {
          UserAPI.add(formData)
            .then(() => {
              ElMessage.success(t("user.message.userForm.addition"));
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        }
      }
    });
  } else if (dialog.type === "user-import") {
    if (!importData?.deptId) {
      ElMessage.warning(t("user.message.userImport.department"));
      return false;
    }
    if (!importData?.file) {
      ElMessage.warning(t("user.message.userImport.excel"));
      return false;
    }
    UserAPI.import(importData?.deptId, importData?.file).then((data) => {
      ElMessage.success(t("user.message.userImport.import"));
      closeDialog();
      resetQuery();
    });
  }
}, 3000);

/** 删除用户 */
function handleDelete(id?: number) {
  const ticketIds = [id || removeIds.value].join(",");
  if (!ticketIds) {
    ElMessage.warning("确认要删除选中的工单");
    return;
  }

  ElMessageBox.confirm("确定要删除此工单吗？", "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 显示滑块验证
    isShow.value = true;
    // 滑块验证成功后的回调
    onSuccess = async () => {
      // 删除逻辑
      await TicketsAPI.DeleteData(ticketIds);
      ElMessage.success("删除成功");
      // resetQuery();
      subAll();
      onClose();
    };
  });
}
// 处理
const handleDeal = async (id: number) => {
  await router.push({
    path: "/workorder/processingticket",
    query: { id: id.toString() },
  });
};

onBeforeMount(async () => {
  // await getstatusList();
  // await gettypeList();
  // await getpriorityList();
  await subAll();
  await loadDeptOptions();
  await handQuery();
});
</script>
<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.search {
  display: flex;
  gap: 10px;
  width: 100%;
  padding: 10px 0;
  background-color: #fff;
}

.s_input {
  width: 260px;
}

:deep(.el-button + .el-button) {
  margin-left: 0 !important;
}
</style>
