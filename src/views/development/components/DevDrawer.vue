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
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="需求名称" prop="requirementName">
            <el-input v-model="form.requirementName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="需求所属模块" prop="requirementModule">
            <el-input v-model="form.requirementModule" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="需求负责人"
            prop="demanderName"
            label-width="100"
          >
            <el-input
              @click="openOrgPicker('需求负责人', 'demander')"
              v-model="form.demanderName"
              placeholder="请选择"
            />
          </el-form-item>
        </el-col>

        <!-- <el-col :span="8">
          <el-form-item label="需求负责人" prop="demander">
            <el-input v-model="form.demander" placeholder="请输入" />
          </el-form-item>
        </el-col> -->
        <el-col :span="8">
          <!-- <el-form-item label="开发负责人" prop="development">
            <el-input v-model="form.development" placeholder="请输入" />
          </el-form-item> -->
          <el-form-item
            label="开发负责人"
            prop="developmentName"
            label-width="100"
          >
            <el-input
              @click="openOrgPicker('开发负责人', 'development')"
              v-model="form.developmentName"
              placeholder="请选择"
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
        />
      </el-form-item>
      <el-form-item label="是否可行(原因)" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          placeholder="请输入"
          :rows="5"
        />
      </el-form-item>
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
import DevelopmentAPI from "@/api/development";
import DeptAPI from "@/api/dept";
import WOrgPicker from "@/views/wflow/common/WOrgPicker.vue";
import { ElDatePicker } from "element-plus";

// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

// 控制组织架构选择器
const orgPicker = ref();
const orgPickerTitle = ref("");
const selectedOrg = ref<User[]>([]);
const multiple = ref(false);
const selectedField = ref<string>(""); // 用于标识选择的负责人类型

// 打开组织架构选择器
const openOrgPicker = (title: string, field: string) => {
  orgPickerTitle.value = title;
  selectedField.value = field; // 设置选择的负责人类型
  // 根据选择的字段设置 selectedOrg
  if (field === "demander") {
    selectedOrg.value = form.demander
      ? [
          {
            id: form.demander,
            name: form.demanderName,
            avatar: "",
            type: "user",
          },
        ]
      : [];
  } else if (field === "development") {
    selectedOrg.value = form.development
      ? [
          {
            id: form.development,
            name: form.developmentName,
            avatar: "",
            type: "user",
          },
        ]
      : [];
  }
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
  if (selectedOrg.value.length > 0) {
    if (selectedField.value === "demander") {
      form.demander = selectedOrg.value[0]?.id || "";
      form.demanderName = selectedOrg.value[0]?.name || "";
    } else if (selectedField.value === "development") {
      form.development = selectedOrg.value[0]?.id || "";
      form.developmentName = selectedOrg.value[0]?.name || "";
    }
  } else {
    if (selectedField.value === "demander") {
      form.demander = "";
      form.demanderName = "";
    } else if (selectedField.value === "development") {
      form.development = "";
      form.developmentName = "";
    }
  }
  selectedOrg.value = []; // 清空已选择的组织数据
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
// const getDeptList = () => {
//   DeptAPI.getOptions().then((data) => {
//     deptList.value = data;
//   });
// };

// 表单数据
const form = reactive({
  id: props.reportData?.id,
  requirementName: "",
  demander: "",
  demanderName: "",
  completionTime: "",
  development: "",
  requirementDescription: "",
  reason: "",
  developmentName: "",
  requirementModule: "",
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    // console.log("Updated reportData:", newData);
    if (newData && newData.id !== undefined) {
      // Object.assign(form, newData);
      form.id = newData.id || "";
      form.requirementName = newData.requirementName || "";
      form.demander = newData.demander || "";
      form.demanderName = newData.demanderName || "";
      form.completionTime = newData.completionTime || "";
      form.development = newData.development || "";
      form.requirementDescription = newData.requirementDescription || "";
      form.reason = newData.reason || "";
      form.developmentName = newData.developmentName || "";
      form.requirementModule = newData.requirementModule || "";
    } else {
      resetForm(); // 确保新建模式时清空表单
    }
  }
);

// 表单引用
const formRef = ref();

const rules = reactive({
  requirementName: [
    { required: true, message: "请输入需求名称", trigger: "blur" },
  ],
  requirementModule: [
    { required: true, message: "请输入需求所属模块", trigger: "blur" },
  ],
  demanderName: [
    { required: true, message: "请选择需求负责人", trigger: "blur" },
  ],
  developmentName: [
    { required: true, message: "请选择开发负责人", trigger: "blur" },
  ],
  completionTime: [
    { required: true, message: "请选择预计完成时间", trigger: "change" },
  ],
  // requirementDescription: [
  //   { required: true, message: "请输入需求描述", trigger: "blur" },
  // ],
  // reason: [
  //   { required: true, message: "请输入是否可行(原因)", trigger: "blur" },
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
        // console.log("form修改", form);
        DevelopmentAPI.updDevelopment(props.reportData.id, form).then(() => {
          ElMessage.success("更新成功");
          emit("submitSuccess");
          resetForm();
          handleClose(); // 关闭抽屉
        });
      } else {
        // console.log("form新增", form);
        DevelopmentAPI.addDevelopment(form).then(() => {
          ElMessage.success("提交成功");
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
    requirementName: "",
    demander: "",
    demanderName: "",
    completionTime: "",
    development: "",
    requirementDescription: "",
    reason: "",
    developmentName: "",
    requirementModule: "",
  });
};

onMounted(() => {
  // getDeptList();
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
