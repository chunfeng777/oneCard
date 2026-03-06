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
        <el-col :span="8">
          <el-form-item label="被考核人" prop="userName" label-width="120">
            <el-input v-model="form.userName" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="考核周期"
            prop="assessmentDate"
            label-width="120"
            disabled
          >
            <el-date-picker
              v-model="form.assessmentDate"
              type="month"
              format="YYYY-MM"
              value-format="YYYY-MM"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="部门">
            <el-tree-select
              v-model="form.deptName"
              filterable
              disabled
              check-strictly
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="考核总分" prop="totalScore" label-width="120">
            <el-input
              v-model="form.totalScore"
              placeholder="请输入考核总分"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="达成率" prop="achievementRate" label-width="120">
            <el-input
              v-model="form.achievementRate"
              placeholder="请输入达成率"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="被考核人" prop="assessorName" label-width="120">
            <el-input v-model="form.assessorName" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>工作能力</el-divider>

      <el-form-item label="执行力" prop="execution" label-width="120">
        <el-input
          v-model="form.execution"
          type="textarea"
          placeholder="请输入执行力"
          :rows="5"
          disabled
        />
      </el-form-item>

      <el-form-item label="团队能力" prop="team" label-width="120">
        <el-input
          v-model="form.team"
          type="textarea"
          placeholder="请输入团队能力"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="专业素养能力"
        prop="professionalism"
        label-width="120"
      >
        <el-input
          v-model="form.professionalism"
          type="textarea"
          placeholder="请输入专业素养能力"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="分析创新能力" prop="analyse" label-width="120">
        <el-input
          v-model="form.analyse"
          type="textarea"
          placeholder="请输入分析创新能力"
          :rows="5"
          disabled
        />
      </el-form-item>

      <!-- 附件部分 -->
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
  userId: "",
  userName: "",
  deptId: "",
  deptName: "",
  positionName: "",
  assessmentDate: "",
  totalScore: "",
  assessmentText: "",
  achievementRate: "",
  assessorId: "",
  assessorName: "",
  fileName: "",
  fileUrl: "",
  analyse: "",
  professionalism: "",
  team: "",
  execution: "",
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      Object.assign(form, newData);
      // 拿到数据之后直接转换回原来的数据
      if (newData.assessmentText) {
        const assessmentData = JSON.parse(newData.assessmentText);
        form.execution = assessmentData.执行力;
        form.team = assessmentData.团队能力;
        form.professionalism = assessmentData.专业素养能力;
        form.analyse = assessmentData.分析创新能力;
      }
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
