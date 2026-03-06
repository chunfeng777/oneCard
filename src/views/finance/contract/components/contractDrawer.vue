<template>
  <el-drawer
    :title="form.id !== undefined ? '编辑' : '新建'"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="50%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="120px" ref="formRef" :rules="rules">
      <el-form-item label="付款公司" prop="paymentCustomerCompanyName">
        <el-input
          placeholder="请输入付款公司"
          v-model="form.paymentCustomerCompanyName"
        />
      </el-form-item>
      <el-row :gutter="24">
        <!-- <el-col :span="12">
          <el-form-item label="付款公司" prop="year">
            <el-input placeholder="请输入付款公司" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="手续费" prop="handlingFee">
            <el-input placeholder="请输入手续费" v-model="form.handlingFee" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="流程状态" prop="processStatus">
            <el-input
              placeholder="请选择流程状态"
              v-model="form.processStatus"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="收款银行名称" prop="receivingBankName">
            <el-input
              placeholder="请输入收款银行名称"
              v-model="form.receivingBankName"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户简称" prop="customerAbbreviation">
            <el-input
              placeholder="请输入客户简称"
              v-model="form.customerAbbreviation"
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户汇款金额" prop="customerRemittanceAmount">
            <el-input
              placeholder="请输入客户汇款金额"
              v-model="form.customerRemittanceAmount"
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="本次收款金额" prop="currentPaymentAmount">
            <el-input
              placeholder="请输入本次收款金额"
              v-model="form.currentPaymentAmount"
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收款人" prop="payee">
            <el-input placeholder="请输入收款人" v-model="form.payee" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="10">
          <el-form-item label="交易完成时间" prop="transactionCompletionTime">
            <el-date-picker
              type="datetime"
              placeholder="请选择交易完成时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              v-model="form.transactionCompletionTime"
            />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="公司合同号" prop="companyContractNumber">
            <el-input
              placeholder="请输入公司合同号"
              v-model="form.companyContractNumber"
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="到款金额" prop="bankPaymentAmount">
            <el-input
              placeholder="请输入到款金额"
              v-model="form.bankPaymentAmount"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import ContractAPI from "@/api/contract";
import DeptAPI from "@/api/dept";
import { ElDatePicker } from "element-plus";

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

const deptList = ref<OptionType[]>(); // 部门列表
// 获取部门下拉列表
const getDeptList = () => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
};

// 表单数据
const form = reactive({
  id: props.reportData?.id,
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
    // console.log("Updated reportData:", newData);
    if (newData && newData.id !== undefined) {
      // Object.assign(form, newData);
      form.id = newData.id || "";
      form.paymentCustomerCompanyName =
        newData.paymentCustomerCompanyName || "";
      form.handlingFee = newData.handlingFee || "";
      form.processStatus = newData.processStatus || "";
      form.paymentArrivalDate = newData.paymentArrivalDate || "";
      form.bankPaymentAmount = newData.bankPaymentAmount || "";
      form.receivingBankName = newData.receivingBankName || "";
      form.customerAbbreviation = newData.customerAbbreviation || "";
      form.receivingCurrency = newData.receivingCurrency || "";
      form.customerRemittanceAmount = newData.customerRemittanceAmount || "";
      form.companyContractNumber = newData.companyContractNumber || "";
      form.currentPaymentAmount = newData.currentPaymentAmount || "";
      form.transactionCompletionTime = newData.transactionCompletionTime || "";
      form.natureOfPayment = newData.natureOfPayment || "";
      form.countryChineseName = newData.countryChineseName || "";
      form.payee = newData.payee || "";
    } else {
      resetForm(); // 确保新建模式时清空表单
    }
  }
);

// 表单引用
const formRef = ref();

const rules = reactive({
  paymentCustomerCompanyName: [
    { required: true, message: "请输入付款公司", trigger: "blur" },
  ],
  handlingFee: [
    { required: true, message: "请输入手续费", trigger: "blur" },
    { pattern: /^\d+(\.\d+)?$/, message: "请输入有效的数字", trigger: "blur" },
  ],
  processStatus: [
    { required: true, message: "请选择流程状态", trigger: "blur" },
  ],
  receivingBankName: [
    { required: true, message: "请输入收款银行名称", trigger: "blur" },
  ],
  customerAbbreviation: [
    { required: true, message: "请输入客户简称", trigger: "blur" },
  ],
  receivingCurrency: [
    { required: true, message: "请输入收款币种", trigger: "blur" },
  ],
  customerRemittanceAmount: [
    { required: true, message: "请输入客户汇款金额", trigger: "blur" },
    { pattern: /^\d+(\.\d+)?$/, message: "请输入有效的数字", trigger: "blur" },
  ],

  natureOfPayment: [
    { required: true, message: "请输入货款性质", trigger: "blur" },
  ],
  companyContractNumber: [
    { required: true, message: "请输入公司合同号", trigger: "blur" },
  ],
  currentPaymentAmount: [
    { required: true, message: "请输入本次收款金额", trigger: "blur" },
    { pattern: /^\d+(\.\d+)?$/, message: "请输入有效的数字", trigger: "blur" },
  ],
  countryChineseName: [
    { required: true, message: "请输入国家中文", trigger: "blur" },
  ],
  payee: [{ required: true, message: "请输入收款人", trigger: "blur" }],
  transactionCompletionTime: [
    { required: true, message: "请选择交易完成时间", trigger: "change" },
  ],
  paymentArrivalDate: [
    { required: true, message: "请选择到款日期", trigger: "change" },
  ],
  bankPaymentAmount: [
    { required: true, message: "请输入到款金额", trigger: "blur" },
    { pattern: /^\d+(\.\d+)?$/, message: "请输入有效的数字", trigger: "blur" },
  ],
});

// 关闭抽屉
const handleClose = () => {
  resetForm();
  emit("update:modelValue", false);
  emit("close");
};

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (props.reportData?.id) {
        // console.log("form修改", form);
        ContractAPI.updContract(props.reportData.id, form).then(() => {
          ElMessage.success("汇报更新成功");
          emit("submitSuccess");
          resetForm();
          handleClose(); // 关闭抽屉
        });
      } else {
        // console.log("form新增", form);
        // 确保提交时包含上传的文件名和文件URL
        ContractAPI.addContract(form).then(() => {
          ElMessage.success("汇报提交成功");
          emit("submitSuccess");
          resetForm();
          handleClose();
        });
      }
    }
  });
};
// 重置表单数据
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
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
};

onMounted(() => {
  getDeptList();
});
</script>

<style scoped lang="scss">
/* 使用 ::v-deep 确保穿透 scoped 样式 */
:deep(.file-upload .el-upload-list__item) {
  width: 400px !important; /* 强制应用样式 */
}
</style>
<!-- 下拉框节点不在当前页面，必须写在不加scoped的style标签里面，否则不生效 -->
<style lang="scss">
.picker-dateNoneYear {
  .el-date-picker__header {
    .el-date-picker__prev-btn {
      > button:first-child {
        display: none;
      }
    }

    .el-date-picker__next-btn {
      > button:last-child {
        display: none;
      }
    }

    > span:nth-child(2) {
      display: none;
    }
  }
}
</style>
