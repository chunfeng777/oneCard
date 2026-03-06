<template>
  <el-drawer
    title="汇报详情"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="100%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="80px" ref="formRef">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="汇报人" prop="realName">
            <el-input v-model="form.realName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="汇报时间" prop="createTime">
            <el-input v-model="form.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="汇报周期" prop="reportCycle">
            <el-input v-model="form.reportCycle" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 本周工作表格 -->
      <el-form-item label="本周工作" prop="reportWeekBList">
        <el-table :data="form.reportWeekBList" border style="width: 100%">
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="工作目标">
            <template #default="scope">
              <el-input v-model="scope.row.jobGoal" disabled type="textarea" />
            </template>
          </el-table-column>
          <el-table-column label="工作内容">
            <template #default="scope">
              <el-input
                v-model="scope.row.jobContent"
                disabled
                type="textarea"
              />
            </template>
          </el-table-column>
          <el-table-column label="开始时间" width="250">
            <template #default="scope">
              <el-input v-model="scope.row.startTime" disabled />
            </template>
          </el-table-column>
          <el-table-column label="完成时间" width="250">
            <template #default="scope">
              <el-input v-model="scope.row.completeTime" disabled />
            </template>
          </el-table-column>

          <el-table-column label="完成状态" width="140">
            <template #default="scope">
              <!-- <el-input v-model="scope.row.isComplete" disabled /> -->
              <el-select v-model="scope.row.isComplete" disabled>
                <el-option label="已完成" :value="1" />
                <el-option label="未完成" :value="0" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item
        label="未完成事项"
        prop="unfinishedBusiness"
        label-width="100"
      >
        <el-input
          v-model="form.unfinishedBusiness"
          type="textarea"
          :rows="5"
          disabled
        />
      </el-form-item>

      <el-form-item label="本周工作总结" prop="workSummary" label-width="100">
        <el-input
          v-model="form.workSummary"
          type="textarea"
          :rows="5"
          disabled
        />
      </el-form-item>

      <el-form-item
        label="下周工作计划"
        prop="nextWeekProject"
        label-width="100"
      >
        <el-input
          v-model="form.nextWeekProject"
          type="textarea"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="组长审核" prop="reviewOpinion" label-width="100">
        <el-input
          v-model="form.reviewOpinion"
          placeholder="请组长输入审核评论语"
          type="textarea"
          :rows="5"
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
        <el-button
          type="primary"
          @click="leaderReview"
          v-hasPerm="['rep:weekly:review']"
          >审核通过</el-button
        >
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<!-- <script lang="ts">
export default {
  name: "ReportDetails",
};
</script> -->

<script lang="ts" setup>
// import { ref, defineExpose, reactive } from "vue";
import ReportAPI from "@/api/report";

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
// 表单数据
const form = reactive({
  id: null,
  realName: "",
  createTime: "",
  reportCycle: "",
  reportWeekBList: [],
  unfinishedBusiness: "",
  workSummary: "",
  nextWeekProject: "",
  fileName: "",
  fileUrl: "",
  reviewOpinion: "",
  reviewStatus: "",
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      form.id = newData.id || "";
      form.realName = newData.realName || "";
      // 格式化汇报时间
      form.createTime = formatTime(newData.createTime) || "";
      form.reportCycle = newData.reportCycle || "";
      form.reportWeekBList = newData.reportWeekBList || [];
      form.unfinishedBusiness = newData.unfinishedBusiness || "";
      form.workSummary = newData.workSummary || "";
      form.nextWeekProject = newData.nextWeekProject || "";
      form.fileName = newData.fileName || "";
      form.fileUrl = newData.fileUrl || "";
      form.reviewOpinion = newData.reviewOpinion || "";
      form.reviewStatus = newData.reviewStatus || "";
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

// 审核通过（已阅）
const leaderReview = () => {
  ElMessageBox.confirm("确定要审核通过吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "success",
  }).then(() => {
    // console.log(form.id, form.reviewOpinion);
    ReportAPI.readReport(form.id, form.reviewOpinion);
    ElMessage.success("审核通过");
    emit("submitSuccess");
    handleClose();
  });
};

// 关闭抽屉
const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};
// defineExpose({ });
</script>

<style scoped></style>
