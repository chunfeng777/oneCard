<template>
  <el-drawer
    :title="form.id !== undefined ? '编辑汇报' : '新建汇报'"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="100%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="80px" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item label="汇报周期" prop="reportCycle" label-width="100">
            <el-date-picker
              v-model="form.reportCycle"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择汇报周期"
            />
          </el-form-item>
        </el-col>

        <!-- 添加工作按钮 -->
        <el-col :span="2">
          <el-button type="primary" @click="addTodayWork">
            <i-ep-plus />添加工作
          </el-button>
        </el-col>
      </el-row>

      <!-- 本周工作表格 -->
      <el-form-item label="本周工作" prop="reportWeekBList" label-width="100">
        <el-table :data="form.reportWeekBList" border style="width: 100%">
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="工作目标">
            <template #default="scope">
              <el-input
                v-model="scope.row.jobGoal"
                placeholder="请输入工作目标"
                type="textarea"
              />
            </template>
          </el-table-column>
          <el-table-column label="工作内容">
            <template #default="scope">
              <el-input
                v-model="scope.row.jobContent"
                placeholder="请输入工作内容"
                type="textarea"
              />
            </template>
          </el-table-column>
          <el-table-column label="开始时间" width="250">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.startTime"
                type="date"
                placeholder="选择开始时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </template>
          </el-table-column>
          <el-table-column label="完成时间" width="250">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.completeTime"
                type="date"
                placeholder="选择完成时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </template>
          </el-table-column>

          <el-table-column label="完成状态" width="140">
            <template #default="scope">
              <el-select v-model="scope.row.isComplete" placeholder="选择状态">
                <el-option label="未完成" value="未完成" />
                <el-option label="已完成" value="已完成" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                @click="removeTodayWork(scope.row.id)"
              >
                删除
              </el-button>
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
          placeholder="请输入未完成事项"
          :rows="5"
        />
      </el-form-item>

      <el-form-item label="本周工作总结" prop="workSummary" label-width="100">
        <el-input
          v-model="form.workSummary"
          type="textarea"
          placeholder="请输入本周工作总结"
          :rows="5"
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
          placeholder="请输入下周工作计划"
          :rows="5"
        />
      </el-form-item>

      <el-form-item label="附件" label-width="100">
        <el-upload
          class="file-upload"
          with-credentials
          :limit="1"
          :show-file-list="false"
          :http-request="customRequest"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
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
import ReportAPI from "@/api/report";
import { FileUploadResponse } from "@/api/daily/model";

// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

const fileList = ref<{ name: string; url: string }[]>([]);

watch(
  () => props.reportData,
  (newData) => {
    // console.log("Updated reportData:", newData);
  }
);

// 控制抽屉的可见性
const visible = ref(props.modelValue);

// 监听 prop 变化以同步 visible 的状态
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal;
    // 如果是新增模式，清空文件列表
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

let workId = 1; // 唯一 ID 追踪器

// 表单数据
const form = reactive({
  id: props.reportData?.id, // 如果传递的 reportData 有 id，就用它
  reportCycle: "",
  reportWeekBList: [
    {
      id: workId++,
      jobGoal: "",
      jobContent: "",
      startTime: "",
      completeTime: "",
      isComplete: "未完成" as "未完成" | "已完成",
    }, // 初始数据，默认状态为“未完成”
  ],
  unfinishedBusiness: "",
  workSummary: "",
  nextWeekProject: "",
  fileName: "",
  fileUrl: "",
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      form.id = newData.id || undefined;
      form.reportCycle = newData.reportCycle || "";
      form.reportWeekBList = newData.reportWeekBList || [];
      form.unfinishedBusiness = newData.unfinishedBusiness || "";
      form.workSummary = newData.workSummary || "";
      form.nextWeekProject = newData.nextWeekProject || "";
      form.fileName = newData.fileName || "";
      form.fileUrl = newData.fileUrl || "";
    }
  }
);

// 添加工作任务
const addTodayWork = () => {
  form.reportWeekBList.push({
    id: workId++, // 为每个新条目分配唯一 ID
    jobGoal: "",
    jobContent: "",
    startTime: "",
    completeTime: "",
    isComplete: "未完成",
  });
};
// 根据 ID 删除工作任务
const removeTodayWork = (id: number) => {
  form.reportWeekBList = form.reportWeekBList.filter((work) => work.id !== id);
};

// 表单引用
const formRef = ref();

// 关闭抽屉
const handleClose = () => {
  resetForm();
  emit("update:modelValue", false);
  emit("close");
};

// 提交表单
const handleSubmit = () => {
  // 先验证 reportCycle 是否填写
  if (!form.reportCycle) {
    ElMessage.error("请选择汇报周期");
    return;
  }

  // 验证工作内容
  const todayWorkValid = form.reportWeekBList.every((work) => work.jobContent);
  if (!todayWorkValid) {
    ElMessage.error("请填写完整的本周工作内容");
    return;
  }

  // 将 reportCycle 转换为字符串格式
  const formattedReportCycle = `${form.reportCycle[0]} ~ ${form.reportCycle[1]}`;

  // 转换工作列表的状态为数字
  const formattedTodayWork = form.reportWeekBList.map((work) => ({
    ...work,
    isComplete: work.isComplete === "已完成" ? 1 : 0, // 转换状态为数字
  }));

  const submittedData = {
    ...form,
    reportCycle: formattedReportCycle,
    reportWeekBList: formattedTodayWork, // 更新工作列表为新格式
  };
  // console.log("提交的数据:", submittedData); // 打印提交的数据
  if (props.reportData?.id) {
    submittedData.id = props.reportData.id;
    ReportAPI.updWeeks(submittedData.id, submittedData).then((res: any) => {
      ElMessage.success("汇报更新成功");
      emit("submitSuccess");
      resetForm();
      handleClose(); // 关闭抽屉
      fileList.value = [];
    });
  } else {
    ReportAPI.addWeeks(submittedData).then((res: any) => {
      ElMessage.success("汇报提交成功");
      emit("submitSuccess");
      resetForm();
      handleClose();
      fileList.value = [];
    });
  }
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
    const res: FileUploadResponse = await ReportAPI.fileOss(formData); // 直接调用 fileOss 上传文件
    // console.log(res);
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

// 删除附件
const handleRemove = () => {
  ReportAPI.fileDelete(form.fileUrl, form.id)
    .then(() => {
      ElMessage.success("文件删除成功");
      form.fileName = "";
      form.fileUrl = "";
      fileList.value = []; // 清空文件列表
    })
    .catch((error) => {
      console.error("文件删除失败", error);
    });
};

const del = () => {
  ElMessageBox.confirm("确定要删除该文件吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ReportAPI.fileDelete(form.fileUrl, form.id).then(() => {
      ElMessage.success("删除成功");
      form.fileName = "";
      form.fileUrl = "";
      fileList.value = []; // 清空文件列表
    });
  });
};

// 重置表单数据
const resetForm = () => {
  workId = 1; // 重置 workId
  form.id = undefined;
  form.reportCycle = "";
  form.reportWeekBList = [
    {
      id: workId++, // ID 从 1 开始
      jobGoal: "",
      jobContent: "",
      startTime: "",
      completeTime: "",
      isComplete: "未完成" as "未完成" | "已完成",
    }, // 初始状态
  ];
  form.unfinishedBusiness = "";
  form.workSummary = "";
  form.nextWeekProject = "";
  form.fileName = "";
  form.fileUrl = "";
};
</script>

<style scoped>
/* 使用 ::v-deep 确保穿透 scoped 样式 */
:deep(.file-upload .el-upload-list__item) {
  width: 400px !important; /* 强制应用样式 */
}
</style>
