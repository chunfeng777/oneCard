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
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="发票提供员" prop="invoiceProvider">
            <el-input
              placeholder="请输入发票提供员"
              v-model="form.invoiceProvider"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票号码" prop="invoiceNumber">
            <el-input
              placeholder="请输入发票号码"
              v-model="form.invoiceNumber"
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
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="发票类型" prop="invoiceType">
            <!-- <el-input placeholder="请选择发票类型" v-model="form.invoiceType" /> -->
            <Dict
              placeholder="发票类型"
              code="InvoiceType"
              v-model="form.invoiceType"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="金额" prop="amount">
            <el-input placeholder="请输入金额" v-model="form.amount" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="税率" prop="taxRate">
            <el-input placeholder="请输入税率" v-model="form.taxRate" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="税额" prop="taxAmount">
            <el-input placeholder="请输入税额" v-model="form.taxAmount" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="价税合计" prop="totalAmount">
            <el-input placeholder="请输入价税合计" v-model="form.totalAmount" />
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
        />
      </el-form-item>
      <!-- 上传附件组件 -->
      <el-form-item label="附件" label-width="100">
        <el-upload
          class="file-upload"
          with-credentials
          :limit="1"
          :show-file-list="false"
          :http-request="customRequest"
          :on-exceed="handleExceed"
          :file-list="fileList"
        >
          <el-button>
            <el-icon><Link /></el-icon>
            上传文件
          </el-button>
        </el-upload>
      </el-form-item>
      <!-- 附件部分 -->
      <el-form-item>
        <!-- 渲染文件名和删除按钮 -->
        <template v-if="form.fileName">
          <el-row :gutter="24">
            <el-col :span="16">
              <el-text>{{ form.fileName }}</el-text>
            </el-col>
            <el-col :span="8">
              <el-button type="danger" size="small" @click="del">
                删除
              </el-button>
            </el-col>
          </el-row>
        </template>
      </el-form-item>
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
import DeptAPI from "@/api/dept";
import InvoiceAPI from "@/api/invoice";
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, reactive, watch, onMounted } from "vue";
import { FileUploadResponse } from "@/api/invoice/model";

// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

const fileList = ref<{ name: string; url: string }[]>([]);

// 控制抽屉的可见性
const visible = ref(props.modelValue);

// 监听 prop 变化以同步 visible 的状态
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal;
    // 如果是新增模式没有id的情况下，清空文件列表
    if (!form.id && visible.value) {
      fileList.value = [];
    } else if (form.id && visible.value) {
      // 如果是编辑模式，填充附件数据
      // 确保在编辑时文件列表中有值，如果没有删除掉就上传文件，会提示用户只能上传一个文件
      fileList.value = form.fileUrl
        ? [{ name: form.fileName, url: form.fileUrl }]
        : [];
    }
  }
);

// 部门列表
const deptList = ref<OptionType[]>();
// 获取部门下拉列表
const getDeptList = () => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
};

// 表单数据
const form = reactive({
  id: props.reportData?.id,
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
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData && newData.id !== undefined) {
      form.id = newData.id || undefined;
      form.invoiceProvider = newData.invoiceProvider || "";
      form.invoiceNumber = newData.invoiceNumber || "";
      form.invoiceDate = newData.invoiceDate || "";
      form.invoiceType = newData.invoiceType || "";
      form.amount = newData.amount || "";
      form.taxRate = newData.taxRate || "";
      form.taxAmount = newData.taxAmount || "";
      form.totalAmount = newData.totalAmount || "";
      form.sellerName = newData.sellerName || "";
      form.sellerTaxCode = newData.sellerTaxCode || "";
      form.fileName = newData.fileName || "";
      form.fileUrl = newData.fileUrl || "";
    } else {
      resetForm(); // 确保新建模式时清空表单
    }
  }
);

// 表单引用
const formRef = ref();

const rules = reactive({
  invoiceProvider: [
    { required: true, message: "发票提供员不能为空", trigger: "blur" },
  ],
  invoiceNumber: [
    { required: true, message: "发票号码不能为空", trigger: "blur" },
    // { pattern: /^\d+$/, message: "发票号码必须为数字", trigger: "blur" },
  ],
  invoiceDate: [
    { required: true, message: "开具时间不能为空", trigger: "change" },
  ],
  invoiceType: [{ required: true, message: "请选择发票类型", trigger: "blur" }],
  amount: [{ required: true, message: "请输入金额", trigger: "blur" }],
  taxRate: [{ required: true, message: "请输入税率", trigger: "blur" }],
  taxAmount: [{ required: true, message: "请输入税额", trigger: "blur" }],
  totalAmount: [{ required: true, message: "请输入价税合计", trigger: "blur" }],
  sellerName: [
    { required: true, message: "请输入销售方信息名称", trigger: "blur" },
  ],
  sellerTaxCode: [
    {
      required: true,
      message: "请输入统一社会信用代码/纳税人识别号",
      trigger: "blur",
    },
  ],
});

// 关闭抽屉
const handleClose = () => {
  resetForm();
  emit("update:modelValue", false);
  emit("close");
};

// 上传附件
const customRequest = async (options: any) => {
  const { file } = options;
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB 转换为字节数

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error("文件大小超过最大限制（100MB）");
    return; // 如果文件太大，停止上传
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    const res: FileUploadResponse = await InvoiceAPI.fileOss(formData); // 调用接口发送文件
    form.fileName = res.name;
    form.fileUrl = res.url;
    fileList.value = [{ name: res.name, url: res.url }]; // 更新文件列表
    ElMessage.success("文件上传成功");
  } catch (error) {
    ElMessage.error("文件上传失败");
  }
};

// 图片上传限制
const handleExceed = () => {
  if (fileList.value.length >= 1) {
    ElMessage.warning("最多只能上传1个附件");
  }
};

// 删除文件
const del = () => {
  ElMessageBox.confirm("确定要删除该文件吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    InvoiceAPI.fileDelete(form.fileUrl, form.id).then(() => {
      ElMessage.success("删除成功");
      form.fileName = "";
      form.fileUrl = "";
      fileList.value = []; // 清空文件列表
    });
  });
};

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (props.reportData?.id) {
        InvoiceAPI.updInvoice(props.reportData.id, form).then(() => {
          ElMessage.success("汇报更新成功");
          emit("submitSuccess");
          resetForm();
          handleClose(); // 关闭抽屉
          fileList.value = [];
        });
      } else {
        InvoiceAPI.addInvoice(form).then(() => {
          ElMessage.success("汇报提交成功");
          emit("submitSuccess");
          resetForm();
          handleClose();
          fileList.value = [];
        });
      }
    }
  });
};

// 重置表单数据
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
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
