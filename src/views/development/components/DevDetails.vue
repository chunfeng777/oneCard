<template>
  <el-drawer
    title="详情"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="50%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="120px" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="需求名称" prop="requirementName">
            <el-input
              v-model="form.requirementName"
              placeholder="请输入"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="需求所属模块" prop="requirementModule">
            <el-input
              v-model="form.requirementModule"
              placeholder="请输入"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="需求负责人" prop="demanderName">
            <el-input
              v-model="form.demanderName"
              placeholder="请输入"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开发负责人" prop="developmentName">
            <el-input
              v-model="form.developmentName"
              placeholder="请输入"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="预计完成时间" prop="completionTime">
            <el-date-picker
              v-model="form.completionTime"
              clearable
              placeholder="请输入"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="需求描述" prop="requirementDescription">
        <el-input
          v-model="form.requirementDescription"
          type="textarea"
          placeholder="请输入"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="是否可行(原因)" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          placeholder="请输入"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-divider v-show="form.acceptanceStatus"> 审核验收的信息 </el-divider>
      <el-form-item label="审核意见" v-if="form.acceptanceResult">
        <el-input
          v-model="form.acceptanceResult"
          type="textarea"
          placeholder="请输入审核意见"
          :rows="5"
          disabled
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="审核验收负责人"
            prop="acceptanceManagerName"
            v-if="form.acceptanceManagerName"
          >
            <el-input v-model="form.acceptanceManagerName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="审核验收时间"
            prop="acceptanceDate"
            v-if="form.acceptanceDate"
          >
            <el-date-picker
              v-model="form.acceptanceDate"
              clearable
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="审核结果" v-if="form.acceptanceStatus">
            <el-radio-group v-model="form.acceptanceStatus">
              <el-radio :label="1" disabled>通过</el-radio>
              <el-radio :label="2" disabled>不通过</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button
          type="primary"
          @click="acceptanceAudits"
          v-hasPerm="['dev:software:acceptanceAudits']"
          >验收审核</el-button
        >
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>

    <!-- 验收审核对话框 -->
    <el-dialog v-model="dialogVisible" title="验收审核" width="500">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.acceptanceResult"
            type="textarea"
            placeholder="请输入审核意见"
            :rows="5"
          />
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.acceptanceStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAudit"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script lang="ts" setup>
import DevelopmentAPI from "@/api/development";

// import dayjs from "dayjs";
// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);
// 控制抽屉的可见性
const visible = ref(props.modelValue);

// 控制对话框的显示和隐藏 （默认为隐藏）
const dialogVisible = ref(false);

// 监听 prop 变化以同步 visible 的状态
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal;
  }
);

// 表单数据
const form = reactive({
  id: null,
  requirementName: "",
  demander: "",
  demanderName: "",
  completionTime: "",
  development: "",
  requirementDescription: "",
  reason: "",
  developmentName: "",
  requirementModule: "",
  acceptanceResult: "",
  acceptanceStatus: 0,
  acceptanceDate: "",
  acceptanceManagerName: "",
});

// 验收审核表单数据
const auditForm = reactive({
  acceptanceResult: "",
  acceptanceStatus: 1,
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      Object.assign(form, newData); // 会覆盖已经格式化的时间值，在 Object.assign 之后再进行格式化
      // form.realName = newData.realName || "";
      // 格式化时间
      // form.createTime = formatTime(newData.createTime) || "";
    }
  }
);
// 验收审核
const acceptanceAudits = () => {
  // 打开对话框
  dialogVisible.value = true;

  // 检查 acceptanceResult 是否有值
  if (form.acceptanceResult) {
    auditForm.acceptanceResult = form.acceptanceResult;
    auditForm.acceptanceStatus = form.acceptanceStatus ?? 1;
  } else {
    // 如果没有值，保持 auditForm 的默认值
    auditForm.acceptanceResult = "";
    auditForm.acceptanceStatus = 1;
  }
};

// 提交审核
const submitAudit = () => {
  // console.log("idid:", form.id);
  // console.log("审核意见:", auditForm.acceptanceResult);
  // console.log("审核结果:", auditForm.acceptanceStatus);

  DevelopmentAPI.auditDevelopment(props.reportData.id, auditForm).then(() => {
    ElMessage.success("审核提交成功");
    // 重新加载详情数据
    fetchData();
    emit("submitSuccess");
  });

  // 清空审核表单(重置表单数据)
  auditForm.acceptanceResult = "";
  auditForm.acceptanceStatus = 1;

  // 关闭对话框
  dialogVisible.value = false;
};

// 详情
const fetchData = async () => {
  const response = await DevelopmentAPI.detailsDevelopment(props.reportData.id);
  if (response) {
    Object.assign(form, response);
    form.acceptanceStatus = form.acceptanceStatus ?? 1;
  }
};

// 格式化时间的方法
// const formatTime = (time: any) => {
//   if (!time) return "";
//   return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
// };

// 关闭抽屉
const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};
</script>

<style scoped></style>
