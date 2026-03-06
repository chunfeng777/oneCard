<template>
  <el-drawer
    title="汇报详情"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="100%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="120px" ref="formRef">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-form-item label="汇报时间" prop="reportCycle" label-width="120">
            <el-date-picker
              v-model="form.reportCycle"
              type="datetime"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="汇报人" prop="realName" label-width="120">
            <el-input v-model="form.realName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="汇报部门">
            <el-tree-select
              v-model="form.deptName"
              filterable
              disabled
              check-strictly
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">今日工作汇报</el-divider>

      <el-form-item
        label="工作进展与成果"
        prop="progressAchievements"
        label-width="120"
      >
        <el-input
          v-model="form.progressAchievements"
          type="textarea"
          :rows="7"
          disabled
        />
      </el-form-item>

      <el-form-item
        label="问题与挑战"
        prop="issuesChallenges"
        label-width="120"
      >
        <el-input
          v-model="form.issuesChallenges"
          type="textarea"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="方案与建议"
        prop="solutionsSuggestions"
        label-width="120"
      >
        <el-input
          v-model="form.solutionsSuggestions"
          type="textarea"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="下一步计划" prop="nextPlan" label-width="120">
        <el-input v-model="form.nextPlan" type="textarea" :rows="5" disabled />
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
console.log(props.reportData);
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
  deptId: "",
  reportCycle: "",
  progressAchievements: "",
  issuesChallenges: "",
  solutionsSuggestions: "",
  nextPlan: "",
  fileName: "",
  fileUrl: "",
  deptName: "",
  realName: "",
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      form.id = newData.id || "";
      form.realName = newData.realName || "";
      form.deptName = newData.deptName || "";
      // 格式化汇报时间
      form.reportCycle = formatTime(newData.reportCycle) || "";
      form.deptId = newData.deptId || "";
      form.progressAchievements = newData.progressAchievements || "";
      form.issuesChallenges = newData.issuesChallenges || "";
      form.solutionsSuggestions = newData.solutionsSuggestions || "";
      form.nextPlan = newData.nextPlan || "";
      form.fileName = newData.fileName || "";
      form.fileUrl = newData.fileUrl || "";
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
