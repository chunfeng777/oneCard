<template>
  <el-drawer
    :title="props.data.id !== undefined ? '编辑会议纪要' : '新增会议纪要'"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="58%"
    :close-on-click-modal="false"
  >
    <!-- 表单内容区域 -->
    <el-form
      label-width="80px"
      ref="formRef"
      :model="formData"
      :rules="formRules"
    >
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="会议时间" prop="meetingTime" label-width="100">
            <el-date-picker
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择会议时间"
              v-model="formData.meetingTime"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="主持人" prop="hostId" label-width="100">
            <el-input
              placeholder="请输入主持人"
              @click="openOrgPicker('主持人')"
              v-model="formData.hostName"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="主办部门" prop="deptId" label-width="100">
            <el-tree-select
              placeholder="请选择主办部门"
              :data="deptList"
              filterable
              check-strictly
              :render-after-expand="false"
              v-model="formData.deptId"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="会议主题" prop="meetingSubject" label-width="100">
        <el-input
          placeholder="请输入会议主题"
          v-model="formData.meetingSubject"
        />
      </el-form-item>
      <el-form-item label="会议内容" prop="meetingContent" label-width="100">
        <el-input
          type="textarea"
          placeholder="请输入会议内容"
          v-model="formData.meetingContent"
          :rows="5"
        />
      </el-form-item>
      <el-form-item label="下一步计划" prop="nextWork" label-width="100">
        <el-input
          type="textarea"
          placeholder="请输入下一步工作计划"
          v-model="formData.nextWork"
          :rows="5"
        />
      </el-form-item>
      <el-form-item label="会议总结" prop="meetingSummary" label-width="100">
        <el-input
          type="textarea"
          placeholder="请输入会议总结"
          v-model="formData.meetingSummary"
          :rows="5"
        />
      </el-form-item>
      <el-form-item label="备注信息" prop="remark" label-width="100">
        <el-input
          type="textarea"
          placeholder="请输入内容"
          v-model="formData.remark"
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
    <!-- 点击主持人弹出组织架构选择器 -->
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
import MeetingAPI from "@/api/meeting";
import DeptAPI from "@/api/dept";
import WOrgPicker from "../../../wflow/common/WOrgPicker.vue";
// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; data: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

const deptList = ref<OptionType[]>(); // 部门列表

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
  console.log(selectedOrg.value);
  formData.hostId = selectedOrg.value[0]?.id;
  formData.hostName = selectedOrg.value[0]?.name;
  orgPicker.value?.close();
};

// 控制抽屉的可见性
const visible = ref(props.modelValue);

// 表单数据
const formData = reactive({
  meetingTime: "",
  hostId: "",
  hostName: "",
  deptId: null,
  meetingSubject: "",
  meetingContent: "",
  nextWork: "",
  meetingSummary: "",
  remark: "",
  id: props.data?.id || undefined,
  deptName: "",
  recorderName: "",
});

// 监听 变化以填充表单数据
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      formData.meetingTime = newData.meetingTime || "";
      formData.hostId = newData.hostId || "";
      formData.hostName = newData.hostName || "";
      formData.deptId = newData.deptId || "";
      formData.deptName = newData.deptName || "";
      formData.meetingSubject = newData.meetingSubject || "";
      formData.meetingContent = newData.meetingContent || "";
      formData.nextWork = newData.nextWork || "";
      formData.meetingSummary = newData.meetingSummary || "";
      formData.remark = newData.remark || "";
      formData.recorderName = newData.recorderName || "";
    }
  }
);

// 表单校验规则
const formRules = {
  meetingTime: [{ required: true, message: "请选择会议时间", trigger: "blur" }],
  hostId: [{ required: true, message: "请输入主持人", trigger: "blur" }],
  deptId: [{ required: true, message: "请选择主办部门", trigger: "change" }],
  meetingSubject: [
    { required: true, message: "请输入会议主题", trigger: "blur" },
  ],
  meetingContent: [
    { required: true, message: "请输入会议内容", trigger: "blur" },
  ],
};

// 监听 prop 变化以同步 visible 的状态
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal;
  }
);

// 表单引用
const formRef = ref();

// 关闭抽屉
const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (props.data?.id) {
        formData.id = props.data.id;
        // 表单验证通过，提交数据
        MeetingAPI.updMeeting(formData.id, formData).then(() => {
          handleClose();
          ElMessage.success("修改会议纪要成功！");
          emit("submitSuccess");
        });
      } else {
        MeetingAPI.addMeeting(formData).then(() => {
          handleClose();
          ElMessage.success("新增会议纪要成功！");
          emit("submitSuccess");
        });
      }
    } else {
      ElMessage.error("表单验证失败，请检查输入内容！");
    }
  });
};
onMounted(() => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
});
</script>

<style scoped></style>
