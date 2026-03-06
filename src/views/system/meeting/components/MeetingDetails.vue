<template>
  <el-drawer
    title="会议纪要"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="58%"
    :close-on-click-modal="false"
  >
    <!-- 表单内容区域 -->
    <el-form label-width="80px" ref="formRef">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="会议时间" prop="meetingTime" label-width="100">
            <el-date-picker
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              v-model="form.meetingTime"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="主持人" label-width="100" prop="hostName">
            <el-input
              @click="openOrgPicker('主持人')"
              v-model="form.hostName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="记录人" label-width="100" prop="recorderName">
            <el-input v-model="form.recorderName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="16">
          <el-form-item
            label="会议主题"
            prop="meetingSubject"
            label-width="100"
          >
            <el-input v-model="form.meetingSubject" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="主办部门" prop="deptName" label-width="100">
            <el-input v-model="form.deptName" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="会议内容" prop="meetingContent" label-width="100">
        <el-input
          type="textarea"
          v-model="form.meetingContent"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="下一步计划" prop="nextWork" label-width="100">
        <el-input type="textarea" v-model="form.nextWork" :rows="5" disabled />
      </el-form-item>
      <el-form-item label="会议总结" prop="meetingSummary" label-width="100">
        <el-input
          type="textarea"
          v-model="form.meetingSummary"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="备注信息" prop="remark" label-width="100">
        <el-input type="textarea" v-model="form.remark" :rows="5" disabled />
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
import WOrgPicker from "../../../wflow/common/WOrgPicker.vue";

// 控制组织架构选择器
const orgPicker = ref();
const orgPickerTitle = ref("");
const selectedOrg = ref([]);
const multiple = ref(false);

// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; data: any }>();
const emit = defineEmits(["update:modelValue", "close"]);

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
  meetingTime: "",
  hostId: null, // 主持人 ID
  hostName: "", // 主持人名称
  deptId: "",
  deptName: "",
  meetingSubject: "",
  meetingContent: "",
  nextWork: "",
  meetingSummary: "",
  remark: "",
  recorderName: "",
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      form.meetingTime = newData.meetingTime || "";
      form.hostId = newData.hostId || "";
      form.hostName = newData.hostName || "";
      form.deptId = newData.deptId || "";
      form.deptName = newData.deptName || "";
      form.meetingSubject = newData.meetingSubject || "";
      form.meetingContent = newData.meetingContent || "";
      form.nextWork = newData.nextWork || "";
      form.meetingSummary = newData.meetingSummary || "";
      form.remark = newData.remark || "";
      form.recorderName = newData.recorderName || "";
    }
  }
);

// 表单引用
const formRef = ref();

// 打开组织架构选择器
const openOrgPicker = (title: string) => {
  orgPickerTitle.value = title;
  orgPicker.value?.open();
};

// 关闭组织架构选择器
const selectOk = () => {
  orgPicker.value?.close();
};
// 关闭抽屉
const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};

// 提交表单
const handleSubmit = () => {};
</script>

<style scoped></style>
