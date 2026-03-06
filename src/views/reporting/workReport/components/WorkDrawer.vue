<template>
  <el-drawer
    :title="form.id !== undefined ? '编辑汇报' : '新建汇报'"
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
              placeholder="请选择汇报时间"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item label="汇报人" prop="startTime" label-width="120">
            <el-input placeholder="请输入汇报人" />
          </el-form-item>
        </el-col> -->
        <el-col :span="8">
          <el-form-item label="汇报部门">
            <el-tree-select
              v-model="form.deptId"
              placeholder="请选择汇报部门"
              :data="deptList"
              filterable
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
          placeholder="请输入工作进展与成果"
          :rows="7"
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
          placeholder="请输入问题与挑战"
          :rows="5"
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
          placeholder="请输入方案与建议"
          :rows="5"
        />
      </el-form-item>
      <el-form-item label="下一步计划" prop="nextPlan" label-width="120">
        <el-input
          v-model="form.nextPlan"
          type="textarea"
          placeholder="请输入下一步计划"
          :rows="5"
        />
      </el-form-item>

      <el-form-item label="附件" label-width="120">
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
import WorkReportsAPI from "@/api/workReports";
import { FileUploadResponse } from "@/api/daily/model";
import DeptAPI from "@/api/dept";

// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

const fileList = ref<{ name: string; url: string }[]>([]);

watch(
  () => props.reportData,
  (newData) => {}
);

const deptList = ref<OptionType[]>(); // 部门下拉列表
// 获取部门下拉选项
const getDeptOptions = async () => {
  const res = await DeptAPI.getOptions();
  deptList.value = res;
};

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

// 表单数据
const form = reactive({
  id: props.reportData?.id, // 如果传递的 reportData 有 id，就用它
  deptId: "",
  reportCycle: "",
  // dayWorkReport: "",
  progressAchievements: "",
  issuesChallenges: "",
  solutionsSuggestions: "",
  nextPlan: "",
  fileName: "",
  fileUrl: "",
});

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      form.id = newData.id || undefined;
      form.deptId = newData.deptId || "";
      form.reportCycle = newData.reportCycle || "";
      form.progressAchievements = newData.progressAchievements || "";
      form.issuesChallenges = newData.issuesChallenges || "";
      form.solutionsSuggestions = newData.solutionsSuggestions || "";
      form.nextPlan = newData.nextPlan || "";
      form.fileName = newData.fileName || "";
      form.fileUrl = newData.fileUrl || "";
    }
  }
);

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
    ElMessage.error("请选择汇报时间");
    return;
  }

  // 将 reportCycle 转换为字符串格式

  // console.log("提交的数据:", submittedData); // 打印提交的数据
  if (props.reportData?.id) {
    form.id = props.reportData.id;
    WorkReportsAPI.upd(form.id, form).then((res: any) => {
      ElMessage.success("汇报更新成功");
      emit("submitSuccess");
      resetForm();
      handleClose(); // 关闭抽屉
      fileList.value = [];
    });
  } else {
    WorkReportsAPI.add(form).then((res: any) => {
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
    const res: FileUploadResponse = await WorkReportsAPI.fileOss(formData); // 直接调用 fileOss 上传文件
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
  WorkReportsAPI.fileDelete(form.fileUrl, form.id)
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
    WorkReportsAPI.fileDelete(form.fileUrl, form.id).then(() => {
      ElMessage.success("删除成功");
      form.fileName = "";
      form.fileUrl = "";
      fileList.value = []; // 清空文件列表
    });
  });
};

// 重置表单数据
const resetForm = () => {
  form.id = undefined;
  form.deptId = "";
  form.reportCycle = "";
  form.progressAchievements = "";
  form.issuesChallenges = "";
  form.solutionsSuggestions = "";
  form.nextPlan = "";
  form.fileName = "";
  form.fileUrl = "";
};

onMounted(() => {
  getDeptOptions();
});
</script>

<style scoped>
/* 使用 ::v-deep 确保穿透 scoped 样式 */
:deep(.file-upload .el-upload-list__item) {
  width: 400px !important; /* 强制应用样式 */
}
</style>
