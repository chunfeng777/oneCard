<template>
  <div class="mt-3 m-6">
    <el-card>
      <el-form
        :model="form"
        label-width="120px"
        :rules="rules"
        ref="ruleFormRef"
      >
        <!-- 标题输入框 -->
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入工单标题" />
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="6">
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
          </el-col>
          <el-col :span="6">
            <!-- 选择用户 -->
            <el-form-item label="选择用户" prop="handlerId">
              <el-select
                v-model="form.handlerId"
                placeholder="请选择所属部门下的用户"
                filterable
                clearable
                popper-append-to-body
                style="width: 100%"
                ref="selectRef"
                popper-class="single-select-loadmore"
                :disabled="!form.deptId"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <!-- 优先级单选按钮 -->
            <el-form-item label="优先级" prop="priority">
              <Dict v-model="form.priority" code="ticketsPriority" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <!-- 类型单选按钮 -->
            <el-form-item label="类型" prop="type">
              <Dict v-model="form.type" code="ticketsType" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 问题描述文本域 -->
        <el-form-item label="问题描述" prop="description">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="请输入工单问题描述"
            :rows="4"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit(ruleFormRef)"
            >提交</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import TicketsAPI from "@/api/tickets";
import { UserQuery, UserPageVO } from "@/api/user/model";
import type { ElSelect } from "element-plus";
import { useNotificationStore } from "@/store/modules/useNotificationStore";
import DeptAPI from "@/api/dept";
import UserAPI from "@/api/user";
import { TicketsReq } from "@/api/tickets/model";
import type { FormInstance, FormRules } from "element-plus";
const notificationStore = useNotificationStore();
const ruleFormRef = ref<FormInstance>();
const rules = reactive({
  title: [{ required: true, message: "请输入工单标题", trigger: "blur" }],
  priority: [{ required: true, message: "请选择工单优先级", trigger: "blur" }],
  type: [{ required: true, message: "请选择工单类型", trigger: "blur" }],
  deptId: [{ required: true, message: "请选择所属部门", trigger: "blur" }],
});
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
});
// 定义 selectRef 的类型
const selectRef = ref<InstanceType<typeof ElSelect> | null>(null);
const deptList = ref<OptionType[]>(); // 部门下拉数据源
//const userList = ref<OptionType[]>(); // 用户下拉数据源
const userList = ref<Array<{ value: string | number; label: string }>>([]);

const form = reactive({
  title: "",
  priority: "",
  description: "",
  deptId: 1,
  type: "", // 默认值
  handlerId: "", // 默认值
});
// 重置表单数据
const resetForm = () => {
  form.title = "";
  form.priority = "";
  form.description = "";
  form.deptId = 1;
  form.handlerId = "";
  form.type = "";
};

/** 加载部门下拉数据源 */
async function loadDeptOptions() {
  // 获取部门下拉列表
  await DeptAPI.depOptions().then((data: any) => {
    deptList.value = data;
  });
}

/** 当所选部门更改时，重新加载所选部门下的用户列表 */
async function changeDept() {
  const selectedDeptId = form.deptId;
  if (selectedDeptId) {
    // 清除之前的用户选择
    form.handlerId = "";
    // 重新加载用户列表
    userList.value = [];
    handleQuery();
  }
}

// 获取用户数据
const handleQuery = async () => {
  if (!form.deptId) return; // 如果没有选择部门，则不查询用户

  const deptId = form.deptId;
  // 根据部门查询用户
  await UserAPI.getUserByDept(deptId).then((data: any) => {
    userList.value = data.map((user: UserPageVO) => ({
      value: user.id !== undefined ? user.id : "undefined",
      label: user.nickname !== undefined ? user.nickname : "undefined",
    }));
    // console.log("userList", userList.value);
  });
};
// 提交表单
const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      const requestData: TicketsReq = {
        title: form.title,
        description: form.description,
        type: form.type,
        deptId: form.deptId,
        handlerId: form.handlerId,
        priority: form.priority,
      };
      TicketsAPI.getFormData(requestData).then((data) => {
        resetForm();
        ElMessage.success("创建工单成功");
        // 更新 lastUpdated，触发订阅者获取最新数据
        notificationStore.updateLastUpdated();
      });
    }
  });
};
// 在页面加载时调用加载部门数据的函数
onMounted(() => {
  loadDeptOptions();
  handleQuery();
});
</script>
<style lang="scss" scoped></style>
