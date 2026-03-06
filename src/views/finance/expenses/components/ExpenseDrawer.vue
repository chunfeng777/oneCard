<template>
  <el-drawer
    :title="form.id !== undefined ? '编辑' : '新建'"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="100%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="120px" ref="formRef" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="年份" prop="year">
            <el-date-picker
              v-model="form.year"
              type="year"
              placeholder="请选择年份"
              format="YYYY"
              value-format="YYYY"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="日期" prop="date">
            <el-date-picker
              popper-class="picker-dateNoneYear"
              clearable
              placeholder="请输起始日期"
              type="date"
              format="MM月DD日"
              value-format="MM-DD"
              v-model="form.date"
            />
          </el-form-item>
        </el-col>

        <el-col :span="5">
          <el-form-item label="费用类型" prop="expenseType">
            <Dict
              v-model="form.expenseType"
              placeholder="选择费用类型"
              code="expenseType"
            />
          </el-form-item>
        </el-col>

        <el-col :span="5">
          <el-form-item label="支付方式" prop="paymentMethod">
            <Dict
              v-model="form.paymentMethod"
              placeholder="选择支付方式"
              code="paymentMethods"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="币种" prop="currency">
            <Dict
              v-model="form.currency"
              placeholder="选择币种"
              code="currency"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="单价" prop="unitPrice">
            <el-input v-model="form.unitPrice" placeholder="请输入单价" />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="数量" prop="number">
            <el-input-number
              :min="1"
              v-model="form.number"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="支付日期" prop="paymentDate">
            <el-date-picker
              v-model="form.paymentDate"
              popper-class="picker-dateNoneYear"
              clearable
              placeholder="请输起始日期"
              type="date"
              format="MM月DD日"
              value-format="MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="总价" prop="totalPrice">
            <el-input v-model="form.totalPrice" placeholder="请输入总价" />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="支出" prop="expense">
            <el-input v-model="form.expense" placeholder="请输入支出" />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="收入" prop="income">
            <el-input v-model="form.income" placeholder="请输入收入" />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="结余" prop="balance">
            <el-input v-model="form.balance" placeholder="请输入结余" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="结算日期" prop="settlementDate">
            <el-date-picker
              v-model="form.settlementDate"
              popper-class="picker-dateNoneYear"
              clearable
              placeholder="请输起始日期"
              type="date"
              format="MM月DD日"
              value-format="MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="支出部门" prop="deptId">
            <el-tree-select
              v-model="form.deptId"
              placeholder="请选择部门"
              :data="deptList"
              filterable
              check-strictly
              class="s_select"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="授权人" prop="authorizerName">
            <el-input
              @click="openOrgPicker('授权人')"
              v-model="form.authorizerName"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="支出费用内容" prop="expenseContent">
        <el-input
          v-model="form.expenseContent"
          type="textarea"
          placeholder="请输入"
          :rows="5"
        />
      </el-form-item>
      <el-form-item label="收入内容" prop="incomeContent">
        <el-input
          v-model="form.incomeContent"
          type="textarea"
          placeholder="请输入"
          :rows="5"
        />
      </el-form-item>

      <el-form-item label="附件" label-width="120">
        <el-upload
          class="file-upload"
          with-credentials
          :show-file-list="true"
          :http-request="customRequest"
          :before-remove="beforeRemove"
          :on-remove="handleRemove"
          :file-list="$fileList"
        >
          <el-button>
            <el-icon><Link /></el-icon>
            上传文件
          </el-button>

          <!-- 文件列表 -->
          <!-- <template #file="{ file }">
            <div class="el-upload-list__item-info">
              <el-icon><Document /></el-icon>
              <span class="el-upload-list__item-file-name"
                >{{ file.name }}123</span
              >
              <span class="el-icon--close" @click="handleRemove(file.url!)">
                <el-icon><Close /></el-icon>
              </span>
            </div>
          </template> -->
        </el-upload>
      </el-form-item>
      <!-- 附件部分
      <el-form-item>
        渲染文件名和删除按钮
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
      </el-form-item> -->
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </template>

    <!-- 点击授权人弹出组织架构选择器 -->
    <w-org-picker
      ref="orgPicker"
      :selected="selectedOrg"
      :multiple="multiple"
      type="user"
      @ok="selectOk"
    />
  </el-drawer>
</template>

<script lang="ts" setup>
import ExpensesAPI from "@/api/expenses";
import DeptAPI from "@/api/dept";
import WOrgPicker from "@/views/wflow/common/WOrgPicker.vue";
import { ElDatePicker } from "element-plus";
import { FileUploadResponse } from "@/api/daily/model";
import type { UploadUserFile } from "element-plus";

const $fileList: any = defineModel("fileList");

// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

// const fileList = ref<{ name: string; url: string }[]>([]);

const fileList = ref<UploadUserFile[]>([]);

// 控制组织架构选择器
const orgPicker = ref();
const orgPickerTitle = ref("");
const selectedOrg = ref<User[]>([]);
const multiple = ref(false);

// 打开组织架构选择器
const openOrgPicker = (title: string) => {
  orgPickerTitle.value = title;
  orgPicker.value?.open();
};

interface User {
  id: string;
  name: string;
  avatar: string;
  type: string;
}

// 关闭组织架构选择器
const selectOk = (data: User[]) => {
  selectedOrg.value = data;
  // console.log(selectedOrg.value);
  form.authorizer = selectedOrg.value[0]?.id;
  form.authorizerName = selectedOrg.value[0]?.name;
  orgPicker.value?.close();
};

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
  year: "",
  date: "",
  expenseType: undefined,
  unitPrice: 0,
  number: 1,
  currency: undefined,
  paymentDate: "",
  settlementDate: "",
  totalPrice: 0,
  expense: 0,
  income: 0,
  balance: 0,
  deptId: undefined,
  paymentMethod: undefined,
  authorizer: "",
  expenseContent: "",
  authorizerName: "",
  incomeContent: "",
  fileName: "",
  fileUrl: "",
  fileList: <any>[],
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    // console.log("Updated reportData:", newData);
    if (newData && newData.id !== undefined) {
      form.id = newData.id || "";
      form.year = newData.year || "";
      form.date = newData.date || "";
      form.expenseType = newData.expenseType || "";
      form.unitPrice = newData.unitPrice || "";
      form.number = newData.number || "";
      form.currency = newData.currency || "";
      form.paymentDate = newData.paymentDate || "";
      form.settlementDate = newData.settlementDate || "";
      form.totalPrice = newData.totalPrice || "";
      form.expense = newData.expense || "";
      form.income = newData.income || "";
      form.balance = newData.balance || "";
      form.deptId = newData.deptId || "";
      form.paymentMethod = newData.paymentMethod || "";
      form.authorizer = newData.authorizer || "";
      form.expenseContent = newData.expenseContent || "";
      form.authorizerName = newData.authorizerName || "";
      form.incomeContent = newData.incomeContent || "";
      form.fileName = newData.fileName || "";
      form.fileUrl = newData.fileUrl || "";
      form.fileList = newData.fileList || [];
    } else {
      resetForm(); // 确保新建模式时清空表单
    }
  }
);

// 监听单价和数量的变化以计算总价
watch(
  () => [form.unitPrice, form.number],
  ([unitPrice, number]) => {
    form.totalPrice = unitPrice * number;
  },
  { immediate: true }
);

// 监听收入和支出的变化以计算结余
watch(
  () => [form.income, form.expense],
  ([income, expense]) => {
    form.balance = income - expense;
  },
  { immediate: true }
);

// 表单引用
const formRef = ref();

const rules = reactive({
  year: [{ required: true, message: "请选择年份", trigger: "change" }],
  date: [{ required: true, message: "请选择日期", trigger: "change" }],
  expenseType: [
    { required: true, message: "请选择费用类型", trigger: "change" },
  ],
  paymentMethod: [
    { required: true, message: "请选择支付方式", trigger: "change" },
  ],
  currency: [{ required: true, message: "请选择币种", trigger: "change" }],
  // unitPrice: [
  //   { required: true, message: "请输入单价", trigger: "blur" },
  //   { type: "number", message: "单价必须是数字", trigger: "blur" },
  // ],
  // number: [
  //   { required: true, message: "请输入数量", trigger: "blur" },
  //   { type: "number", message: "数量必须是数字", trigger: "blur" },
  // ],
  paymentDate: [
    { required: true, message: "请选择支付日期", trigger: "change" },
  ],
  // totalPrice: [
  //   { required: true, message: "请输入总价", trigger: "blur" },
  //   { type: "number", message: "总价必须是数字", trigger: "blur" },
  // ],
  // expense: [
  //   { required: true, message: "请输入支出", trigger: "blur" },
  //   { type: "number", message: "支出必须是数字", trigger: "blur" },
  // ],
  // income: [
  //   { required: true, message: "请输入收入", trigger: "blur" },
  //   { type: "number", message: "收入必须是数字", trigger: "blur" },
  // ],
  // balance: [
  //   { required: true, message: "请输入结余", trigger: "blur" },
  //   { type: "number", message: "结余必须是数字", trigger: "blur" },
  // ],
  settlementDate: [
    { required: true, message: "请选择结算日期", trigger: "change" },
  ],
  deptId: [{ required: true, message: "请选择支出部门", trigger: "change" }],
  authorizerName: [
    { required: true, message: "请输入授权人", trigger: "blur" },
  ],
  // expenseContent: [
  //   { required: true, message: "请输入支出费用内容", trigger: "blur" },
  // ],
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
        form.fileList = fileList;
        // console.log("form修改", form);
        ExpensesAPI.updExpense(props.reportData.id, form).then(() => {
          ElMessage.success("汇报更新成功");
          emit("submitSuccess");
          resetForm();
          handleClose(); // 关闭抽屉
        });
      } else {
        // console.log("form新增", form);
        // 确保提交时包含上传的文件名和文件URL
        ExpensesAPI.addExpense(form).then(() => {
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
    year: "",
    date: "",
    expenseType: undefined,
    unitPrice: 0,
    number: 1,
    currency: undefined,
    paymentDate: "",
    settlementDate: "",
    totalPrice: 0,
    expense: 0,
    income: 0,
    balance: 0,
    deptId: undefined,
    paymentMethod: undefined,
    authorizer: "",
    expenseContent: "",
    authorizerName: "",
    incomeContent: "",
    fileName: "",
    fileUrl: "",
    fileList: [],
  });
};

// 上传附件
const customRequest = async (options: any) => {
  const { file } = options;
  // console.log(file);

  // 限制最大上传文件大小为 100MB
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB 转换为字节数

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error("文件大小超过最大限制（100MB）");
    return; // 如果文件太大，停止上传
  }

  try {
    // 创建 FormData 对象并将文件添加到其中
    const formData = new FormData();
    formData.append("file", file);

    // 打印 FormData 的内容
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    // 调用接口发送文件
    const res: FileUploadResponse = await ExpensesAPI.fileOss(formData); // 直接调用 fileOss 上传文件
    // console.log(res);
    form.fileName = res.name;
    form.fileUrl = res.url;
    fileList.value = [...fileList.value, { name: res.name, url: res.url }]; // 更新文件列表

    $fileList.value.push({ name: res.name, url: res.url });
    console.log(fileList.value, 11111111111111);

    ElMessage.success("文件上传成功");
  } catch (error) {
    ElMessage.error("文件上传失败");
  }
};

// 删除附件
const handleRemove = (file: any, DeletefileList: any) => {
  console.log(file, fileList);

  ExpensesAPI.fileDelete(file, form.id)
    .then(() => {
      ElMessage.success("文件删除成功");
      // form.fileList = []; // 清空文件列表
      fileList.value = DeletefileList;
    })
    .catch((error) => {
      console.error("文件删除失败", error);
    });
};

// 在删除文件之前进行确认提示
const beforeRemove = () => {
  return ElMessageBox.confirm("确定要删除该文件吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 如果用户确认，返回true以继续删除
      return true;
    })
    .catch(() => {
      // 如果用户取消，返回false以阻止删除
      return false;
    });
};

// // 图片上传限制
// const handleExceed = () => {
//   if (fileList.value.length >= 1) {
//     ElMessage.warning("最多只能上传1个附件");
//   }
// };

// 监听 prop 变化以同步 visible 的状态
// watch(
//   () => props.modelValue,
//   (newVal) => {
//     visible.value = newVal;
//     // 如果是新增模式，清空文件列表
//     if (!form.id && visible.value) {
//       fileList.value = [];
//     } else if (form.id && visible.value) {
//       // 如果是编辑模式，填充附件数据
//       // 确保在编辑时文件列表中有值，如果没有删除掉就上传文件，会提示用户只能上传一个文件
//       console.log(props, "props");

//       fileList.value = form.fileList;
//       // ? [{ name: form.fileName, url: form.fileUrl }]
//       // : [];
//       console.log(form);
//     }
//   }
//   // {
//   //   immediate: true,
//   //   deep: true,
//   // }
// );

const del = () => {
  ElMessageBox.confirm("确定要删除该文件吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ExpensesAPI.fileDelete(form.fileUrl, form.id).then(() => {
      console.log(123);

      ElMessage.success("删除成功");
      form.fileName = "";
      form.fileUrl = "";
      // fileList.value = []; // 清空文件列表
    });
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

.el-upload-list__item .el-icon--close {
  position: absolute;
  top: 50%;
  right: 5px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  opacity: 0.75;
  transition: opacity var(--el-transition-duration);
  transform: translateY(-50%);
}

:deep(.el-upload-list) {
  margin: 0;
}

:deep(.el-upload-list__item) {
  margin: 0;
}
</style>
