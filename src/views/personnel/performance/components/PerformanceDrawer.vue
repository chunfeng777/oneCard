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
        <el-col :span="8">
          <el-form-item label="被考核人" prop="userName" label-width="120">
            <el-input
              v-model="form.userName"
              placeholder="请选择被考核人"
              @click="openOrgPicker('被考核人')"
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="考核周期"
            prop="assessmentDate"
            label-width="120"
          >
            <el-date-picker
              v-model="form.assessmentDate"
              type="month"
              format="YYYY-MM"
              value-format="YYYY-MM"
              placeholder="请选择考核周期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="部门">
            <el-tree-select
              v-model="form.deptId"
              placeholder="请选择部门"
              :data="deptList"
              filterable
              check-strictly
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="考核总分" prop="totalScore" label-width="120">
            <el-input v-model="form.totalScore" placeholder="请输入考核总分" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="达成率" prop="achievementRate" label-width="120">
            <el-input
              v-model="form.achievementRate"
              placeholder="请输入达成率"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="考核人" prop="assessorName" label-width="120">
            <el-input
              v-model="form.assessorName"
              placeholder="请选择考核人"
              @click="openAssessorOk('考核人')"
            />
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
        />
      </el-form-item>

      <el-form-item label="团队能力" prop="team" label-width="120">
        <el-input
          v-model="form.team"
          type="textarea"
          placeholder="请输入团队能力"
          :rows="5"
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
        />
      </el-form-item>
      <el-form-item label="分析创新能力" prop="analyse" label-width="120">
        <el-input
          v-model="form.analyse"
          type="textarea"
          placeholder="请输入分析创新能力"
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
    <w-org-picker
      ref="orgPicker"
      :selected="selectedOrg"
      :multiple="multiple"
      type="user"
      @ok="selectOk"
    />
    <w-org-picker
      ref="orgPickerAssessor"
      :selected="selectedAssessor"
      :multiple="multiple"
      type="user"
      @ok="selectAssessorOk"
    />
  </el-drawer>
</template>

<script lang="ts" setup>
import PerformanceAPI from "@/api/performance";
import { FileUploadResponse } from "@/api/performance/model";
import DeptAPI from "@/api/dept";
import WOrgPicker from "../../../wflow/common/WOrgPicker.vue";

// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

const fileList = ref<{ name: string; url: string }[]>([]);
// 控制组织架构选择器
const orgPicker = ref();
const orgPickerAssessor = ref();
const orgPickerTitle = ref("");
const orgPickerAssessorOk = ref("");
const selectedOrg = ref<User[]>([]);
const selectedAssessor = ref<User[]>([]);
const multiple = ref(false);

// 打开组织架构选择器
const openOrgPicker = (title: string) => {
  orgPickerTitle.value = title;
  orgPicker.value?.open();
};
// 打开组织架构选择器
const openAssessorOk = (title: string) => {
  orgPickerAssessorOk.value = title;
  orgPickerAssessor.value?.open();
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
  form.userId = selectedOrg.value[0]?.id;
  form.userName = selectedOrg.value[0]?.name;
  orgPicker.value?.close();
};

// 关闭组织架构选择器
const selectAssessorOk = (data: User[]) => {
  selectedAssessor.value = data;
  console.log(selectedAssessor.value);
  form.assessorId = selectedAssessor.value[0]?.id;
  form.assessorName = selectedAssessor.value[0]?.name;
  orgPickerAssessor.value?.close();
};

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
  // createTime: "",
  // updateTime: "",
  fileName: "",
  fileUrl: "",
  analyse: "",
  professionalism: "",
  team: "",
  execution: "",
});

// 校验规则
const rules = {
  userName: [{ required: true, message: "请选择被考核人", trigger: "change" }],
  assessmentDate: [
    { required: true, message: "请选择考核周期", trigger: "change" },
  ],
  deptId: [{ required: true, message: "请选择部门", trigger: "change" }],
  totalScore: [
    { required: true, message: "请输入考核总分", trigger: "blur" },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: "请输入有效的数字",
      trigger: "blur",
    },
  ],
  achievementRate: [
    { required: true, message: "请输入达成率", trigger: "blur" },
    // {
    //   pattern: /^\d+(\.\d{1,2})?$/,
    //   message: "请输入有效的数字",
    //   trigger: "blur",
    // },
  ],
  assessorName: [
    { required: true, message: "请选择考核人", trigger: "change" },
  ],
  execution: [{ required: true, message: "请输入执行力", trigger: "blur" }],
  team: [{ required: true, message: "请输入团队能力", trigger: "blur" }],
  professionalism: [
    { required: true, message: "请输入专业素养能力", trigger: "blur" },
  ],
  analyse: [{ required: true, message: "请输入分析创新能力", trigger: "blur" }],
};

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      Object.assign(form, newData);
      // form.id = newData.id || undefined;
      // form.deptId = newData.deptId || "";
      // form.userId = newData.userId || "";
      // form.reportCycle = newData.reportCycle || "";
      // form.progressAchievements = newData.progressAchievements || "";
      // form.issuesChallenges = newData.issuesChallenges || "";
      // form.solutionsSuggestions = newData.solutionsSuggestions || "";
      // form.nextPlan = newData.nextPlan || "";
      // form.fileName = newData.fileName || "";
      // form.fileUrl = newData.fileUrl || "";
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

// 表单引用
const formRef = ref();

// 关闭抽屉
const handleClose = () => {
  resetForm();
  emit("update:modelValue", false);
  emit("close");
};

// 提交表单
const handleSubmit = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 合并能力字段为 assessmentText
        const assessmentText = JSON.stringify({
          执行力: form.execution,
          团队能力: form.team,
          专业素养能力: form.professionalism,
          分析创新能力: form.analyse,
        });

        const payload = {
          ...form,
          assessmentText,
        };

        if (form.id) {
          await PerformanceAPI.updPerformance(form.id, payload);
          ElMessage.success("更新成功");
        } else {
          await PerformanceAPI.addPerformance(payload);
          ElMessage.success("提交成功");
        }
        emit("submitSuccess");
        resetForm();
        handleClose();
        fileList.value = [];
      } catch (error) {
        ElMessage.error("操作失败");
      }
    } else {
      ElMessage.error("请完成表单校验");
    }
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
    const res: FileUploadResponse = await PerformanceAPI.fileOss(formData); // 直接调用 fileOss 上传文件
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
  PerformanceAPI.fileDelete(form.fileUrl, form.id)
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
    PerformanceAPI.fileDelete(form.fileUrl, form.id).then(() => {
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
  form.userId = "";
  form.userName = "";
  form.deptName = "";
  form.positionName = "";
  form.analyse = "";
  form.professionalism = "";
  form.team = "";
  form.assessmentDate = "";
  form.totalScore = "";
  form.assessmentText = "";
  form.userName = "";
  form.achievementRate = "";
  form.achievementRate = "";
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
