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
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="发票提供员" prop="invoiceProvider">
            <el-input
              placeholder="请输入发票提供员"
              v-model="form.invoiceProvider"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票号码" prop="invoiceNumber">
            <el-input
              placeholder="请输入发票号码"
              v-model="form.invoiceNumber"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="开具时间" prop="invoiceDate">
            <el-date-picker
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请输入开具时间"
              v-model="form.invoiceDate"
              disabled
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="发票类型" prop="invoiceType">
            <Dict
              placeholder="发票类型"
              code="InvoiceType"
              v-model="form.invoiceType"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="金额" prop="amount">
            <el-input placeholder="请输入金额" v-model="form.amount" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="税率" prop="taxRate">
            <el-input
              placeholder="请输入税率"
              v-model="form.taxRate"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="税额" prop="taxAmount">
            <el-input
              placeholder="请输入税额"
              v-model="form.taxAmount"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="价税合计" prop="totalAmount">
            <el-input
              placeholder="请输入价税合计"
              v-model="form.totalAmount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="销售方信息名称"
        prop="sellerName"
        label-width="230px"
      >
        <el-input
          placeholder="请输入销售方信息名称"
          v-model="form.sellerName"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="统一社会信用代码/纳税人识别号"
        prop="sellerTaxCode"
        label-width="230px"
      >
        <el-input
          placeholder="请输入统一社会信用代码/纳税人识别号"
          v-model="form.sellerTaxCode"
          disabled
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileName" label-width="100">
        <template v-if="form.fileName">
          <el-link
            type="primary"
            :underline="false"
            @click="handleDownload(form.fileUrl)"
            style="cursor: pointer"
            >{{ form.fileName }}</el-link
          >
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
  invoiceProvider: "",
  invoiceNumber: "",
  invoiceDate: "",
  invoiceType: "",
  amount: "",
  taxRate: "",
  taxAmount: "",
  totalAmount: "",
  sellerName: "",
  sellerTaxCode: "",
  fileName: "",
  fileUrl: "",
  duplicateCheck: 0, // 添加 duplicateCheck 属性
});
// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      Object.assign(form, newData); // 会覆盖已经格式化的时间值，在 Object.assign 之后再进行格式化
      // form.realName = newData.realName || "";
      // 格式化汇报时间
      // form.createTime = formatTime(newData.createTime) || "";
    }
  }
);

// 下载附件
const handleDownload = async (fileUrl: string) => {
  // console.log(fileUrl);
  ElMessageBox.confirm(`确定要下载【${form.fileName}】吗?`, "提示", {
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
    link.download = form.fileName;
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

// 格式化时间的方法
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 关闭抽屉
const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};
</script>

<style scoped></style>
