<template>
  <el-drawer
    title="详情"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="100%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="80px" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="年份" prop="year" label-width="100">
            <el-date-picker
              v-model="form.year"
              type="year"
              placeholder="请选择年份"
              format="YYYY"
              value-format="YYYY"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="日期" prop="date" label-width="100">
            <el-date-picker
              popper-class="picker-dateNoneYear"
              clearable
              placeholder="请输起始日期"
              type="date"
              format="MM月DD日"
              value-format="MM-DD"
              v-model="form.date"
              disabled
            />
          </el-form-item>
        </el-col>

        <el-col :span="5">
          <el-form-item label="费用类型" prop="expenseType" label-width="100">
            <Dict
              v-model="form.expenseType"
              placeholder="选择费用类型"
              code="expenseType"
              disabled
            />
          </el-form-item>
        </el-col>

        <el-col :span="5">
          <el-form-item label="支付方式" prop="paymentMethod" label-width="100">
            <Dict
              v-model="form.paymentMethod"
              placeholder="选择支付方式"
              code="paymentMethods"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="币种" prop="currency" label-width="100">
            <Dict
              v-model="form.currency"
              placeholder="选择币种"
              code="currency"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="单价" prop="unitPrice" label-width="100">
            <el-input
              v-model="form.unitPrice"
              placeholder="请输入单价"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="数量" prop="number" label-width="100">
            <el-input-number
              :min="1"
              v-model="form.number"
              placeholder="请输入"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="支付日期" prop="paymentDate" label-width="100">
            <el-date-picker
              v-model="form.paymentDate"
              popper-class="picker-dateNoneYear"
              clearable
              placeholder="请输起始日期"
              type="date"
              format="MM月DD日"
              value-format="MM-DD"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="总价" prop="totalPrice" label-width="100">
            <el-input
              v-model="form.totalPrice"
              placeholder="请输入总价"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="支出" prop="expense" label-width="100">
            <el-input
              v-model="form.expense"
              placeholder="请输入支出"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="收入" prop="income" label-width="100">
            <el-input v-model="form.income" placeholder="请输入收入" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="结余" prop="balance" label-width="100">
            <el-input
              v-model="form.balance"
              placeholder="请输入结余"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item
            label="结算日期"
            prop="settlementDate"
            label-width="100"
          >
            <el-date-picker
              v-model="form.settlementDate"
              popper-class="picker-dateNoneYear"
              clearable
              placeholder="请输起始日期"
              type="date"
              format="MM月DD日"
              value-format="MM-DD"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="支出部门" prop="deptId" label-width="100">
            <el-tree-select
              v-model="form.deptName"
              placeholder="请选择部门"
              filterable
              check-strictly
              class="s_select"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="授权人" prop="authorizer" label-width="100">
            <el-input
              v-model="form.authorizerName"
              placeholder="请输入"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="支出费用内容"
        prop="expenseContent"
        label-width="100"
      >
        <el-input
          v-model="form.expenseContent"
          type="textarea"
          placeholder="请输入工作总结"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="收入内容" prop="incomeContent" label-width="100">
        <el-input
          v-model="form.incomeContent"
          type="textarea"
          placeholder="请输入"
          :rows="5"
          disabled
        />
      </el-form-item>

      <el-form-item label="附件" prop="fileName" label-width="100">
        <template v-if="form.fileList">
          <div class="file-list">
            <el-link
              v-for="(item, index) in form.fileList"
              :key="index"
              type="primary"
              :underline="false"
              @click="handleDownload(item.name, item.url)"
              style="cursor: pointer"
              >{{ item.name }}</el-link
            >
          </div>
        </template>
        <template v-else>
          <span>无</span>
        </template>
      </el-form-item>
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import ExpensesAPI from "@/api/expenses";

import dayjs from "dayjs";
// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);
// 控制抽屉的可见性
const visible = ref(props.modelValue);

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
  year: "",
  date: "",
  expenseType: undefined,
  unitPrice: undefined,
  number: undefined,
  currency: undefined,
  paymentDate: "",
  settlementDate: "",
  totalPrice: undefined,
  expense: undefined,
  income: undefined,
  balance: undefined,
  deptId: undefined,
  paymentMethod: undefined,
  authorizer: "",
  expenseContent: "",
  authorizerName: "",
  deptName: "",
  incomeContent: "",
  fileName: "",
  fileUrl: "",
  fileList: <any>[],
});
// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      Object.assign(form, newData); // 会覆盖已经格式化的时间值，在 Object.assign 之后再进行格式化
      console.log(form.fileList);
      // form.realName = newData.realName || "";
      // 格式化汇报时间
      // form.createTime = formatTime(newData.createTime) || "";
    }
  }
);

// 格式化时间的方法
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 下载附件
const handleDownload = async (fileName: string, fileUrl: string) => {
  // console.log(fileUrl);
  ElMessageBox.confirm(`确定要下载【${fileName}】吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "success",
  }).then(async () => {
    // 使用 fetch API 下载文件
    console.log(fileUrl);

    const downloadResponse = await fetch(fileUrl);
    const blob = await downloadResponse.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
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

// 关闭抽屉
const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  align-items: baseline;
}
</style>
