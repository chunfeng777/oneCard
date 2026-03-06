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
      <el-form-item label="付款公司" prop="paymentCustomerCompanyName">
        <el-input
          placeholder="请输入付款公司"
          v-model="form.paymentCustomerCompanyName"
          disabled
        />
      </el-form-item>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="手续费" prop="handlingFee">
            <el-input
              placeholder="请输入手续费"
              v-model="form.handlingFee"
              disabled
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="流程状态" prop="processStatus">
            <el-input
              placeholder="请选择流程状态"
              v-model="form.processStatus"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="收款银行名称" prop="receivingBankName	">
            <el-input
              placeholder="请输入收款银行名称"
              v-model="form.receivingBankName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户简称" prop="customerAbbreviation">
            <el-input
              placeholder="请输入客户简称"
              v-model="form.customerAbbreviation"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="收款币种" prop="receivingCurrency">
            <el-input
              placeholder="请输入收款币种"
              v-model="form.receivingCurrency"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户汇款金额" prop="customerRemittanceAmount">
            <el-input
              placeholder="请输入客户汇款金额"
              v-model="form.customerRemittanceAmount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="货款性质" prop="natureOfPayment">
            <el-input
              placeholder="请输入货款性质"
              v-model="form.natureOfPayment"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="本次收款金额" prop="currentPaymentAmount">
            <el-input
              placeholder="请输入本次收款金额"
              v-model="form.currentPaymentAmount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="国家中文" prop="countryChineseName">
            <el-input
              placeholder="请输入国家中文"
              v-model="form.countryChineseName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收款人" prop="payee">
            <el-input
              placeholder="请输入收款人"
              v-model="form.payee"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="10">
          <el-form-item label="交易完成时间" prop="transactionCompletionTime	">
            <el-date-picker
              type="datetime"
              placeholder="请选择交易完成时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              v-model="form.transactionCompletionTime"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="公司合同号" prop="companyContractNumber">
            <el-input
              placeholder="请输入公司合同号"
              v-model="form.companyContractNumber"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="10">
          <el-form-item label="到款日期" prop="paymentArrivalDate">
            <el-date-picker
              placeholder="请选择到款日期"
              v-model="form.paymentArrivalDate"
              type="datetime"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="到款金额" prop="bankPaymentAmount">
            <el-input
              placeholder="请输入到款金额"
              v-model="form.bankPaymentAmount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
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
  paymentCustomerCompanyName: "",
  handlingFee: "",
  processStatus: "",
  paymentArrivalDate: "",
  bankPaymentAmount: "",
  receivingBankName: "",
  customerAbbreviation: "",
  receivingCurrency: "",
  customerRemittanceAmount: "",
  companyContractNumber: "",
  currentPaymentAmount: "",
  transactionCompletionTime: "",
  natureOfPayment: "",
  countryChineseName: "",
  payee: "",
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
