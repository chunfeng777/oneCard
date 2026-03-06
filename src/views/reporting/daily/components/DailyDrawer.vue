<template>
  <el-drawer
    :title="form.id !== undefined ? '编辑汇报' : '新建汇报'"
    v-model="visible"
    :wrapperClosable="false"
    @close="handleClose"
    size="100%"
  >
    <!-- 表单内容区域 -->
    <el-form :model="form" label-width="80px" ref="formRef" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="开始时间" prop="startTime" label-width="100">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-form-item label-width="100">
            <el-button type="primary" @click="addWorkItem">
              <i-ep-plus />添加工作
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 动态表单部分 -->
      <el-form-item label="今日工作" prop="reportDailyBS" label-width="100">
        <el-table :data="form.reportDailyBS" border style="width: 100%">
          <el-table-column prop="startTime" label="工作目标">
            <template #default="{ row }">
              <el-input
                v-model="row.workObjective"
                placeholder="请输入工作目标"
                type="textarea"
              />
            </template>
          </el-table-column>

          <el-table-column prop="startTime" label="工作内容">
            <template #default="{ row }">
              <el-input
                v-model="row.workContent"
                placeholder="请输入工作内容"
                type="textarea"
              />
            </template>
          </el-table-column>

          <el-table-column
            prop="plannedEndTime"
            label="计划结束时间"
            width="250"
          >
            <template #default="{ row }">
              <el-date-picker
                v-model="row.plannedEndTime"
                type="datetime"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择计划结束时间"
              />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="140">
            <template #default="{ row }">
              <el-select v-model="row.status" placeholder="请选择状态">
                <el-option label="已完成" :value="1" />
                <el-option label="未完成" :value="0" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="deadlineTime" label="截止完成时间" width="250">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.deadlineTime"
                type="datetime"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择截止完成时间"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button
                size="small"
                @click="removeWorkItem(row.id)"
                link
                type="primary"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="工作总结" prop="workSummary" label-width="100">
        <el-input
          v-model="form.workSummary"
          type="textarea"
          placeholder="请输入工作总结"
          :rows="5"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark" label-width="100">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入"
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
import DailyAPI from "@/api/daily";
import { FileUploadResponse } from "@/api/daily/model";
// 定义 props 和 emits
const props = defineProps<{ modelValue: boolean; reportData: any }>();
const emit = defineEmits(["update:modelValue", "close", "submitSuccess"]);

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

let idCounter = 1;

const fileList = ref<{ name: string; url: string }[]>([]);

// 表单数据
const form = reactive({
  id: props.reportData?.id,
  realName: "",
  positionName: "",
  // workObjective: "",
  // workContent: "",
  workSummary: "",
  startTime: "",
  // plannedEndTime: "",
  // status: 0,
  // deadlineTime: "",
  remark: "",

  reportDailyBS: [
    {
      id: idCounter++,
      plannedEndTime: "",
      status: 0,
      deadlineTime: "",
      workObjective: "",
      workContent: "",
    },
  ],
  fileName: "",
  fileUrl: "",
});

// 添加一行工作项
const addWorkItem = () => {
  form.reportDailyBS.push({
    id: idCounter++,
    plannedEndTime: "",
    status: 0,
    deadlineTime: "",
    workObjective: "",
    workContent: "",
  });
};

// 删除工作项
const removeWorkItem = (id: number) => {
  form.reportDailyBS = form.reportDailyBS.filter((work) => work.id !== id);
};

// 监听 reportData 变化以填充表单数据
watch(
  () => props.reportData,
  (newData) => {
    // console.log("Updated reportData:", newData);
    if (newData && newData.id !== undefined) {
      // Object.assign(form, newData);
      form.id = newData.id || "";
      form.realName = newData.realName || "";
      form.positionName = newData.positionName || "";
      form.startTime = newData.startTime || "";
      form.workSummary = newData.workSummary || "";
      form.remark = newData.remark || "";
      // 如果有日报明细，替换
      form.reportDailyBS = newData.reportDailyBS || form.reportDailyBS;
      form.fileName = newData.fileName || "";
      form.fileUrl = newData.fileUrl || "";
    } else {
      resetForm(); // 确保新建模式时清空表单
    }
  }
);

// 表单引用
const formRef = ref();

const rules = reactive({
  startTime: [{ required: true, message: "请选择开始时间", trigger: "blur" }],
  // plannedEndTime: [
  //   { required: true, message: "请选择计划结束时间", trigger: "blur" },
  // ],
  // workObjective: [
  //   { required: true, message: "请输入工作目标", trigger: "blur" },
  // ],
  // workContent: [{ required: true, message: "请输入工作内容", trigger: "blur" }],
  // status: [{ required: true, message: "请选择状态", trigger: "change" }],
  reportDailyBS: [
    {
      validator: (rule: any, value: any, callback: Function) => {
        if (!value || value.length === 0) {
          callback(new Error("请至少添加一项工作"));
        } else {
          const hasError = value.some((item: any) => {
            if (!item.workObjective) {
              return "请填写工作目标";
            }
            if (!item.workContent) {
              return "请填写工作内容";
            }
            if (!item.plannedEndTime) {
              return "请选择计划结束时间";
            }
            if (item.status === undefined) {
              return "请选择状态";
            }
            // if (!item.deadlineTime) {
            //   return "请选择截止完成时间";
            // }
            return false;
          });
          if (hasError) {
            callback(new Error("请完成所有工作项的填写"));
          } else {
            callback();
          }
        }
      },
      trigger: "blur",
    },
  ],
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
        DailyAPI.updDailys(props.reportData.id, form).then(() => {
          ElMessage.success("汇报更新成功");
          emit("submitSuccess");
          resetForm();
          handleClose(); // 关闭抽屉
          fileList.value = [];
        });
      } else {
        // console.log("form新增", form);
        // 确保提交时包含上传的文件名和文件URL
        DailyAPI.addDaily(form).then(() => {
          ElMessage.success("汇报提交成功");
          emit("submitSuccess");
          resetForm();
          handleClose();
          fileList.value = [];
        });
      }
    }
  });
};

// 文件名
const filename = ref("");
// 文件地址
const fileUrl = ref("");
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
    const res: FileUploadResponse = await DailyAPI.fileOss(formData); // 直接调用 fileOss 上传文件
    // console.log(res);
    // filename.value = res.name;
    // fileUrl.value = res.url;
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
  DailyAPI.fileDelete(form.fileUrl, form.id)
    .then(() => {
      ElMessage.success("文件删除成功");
      // filename.value = "";
      // fileUrl.value = "";
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
    DailyAPI.fileDelete(form.fileUrl, form.id).then(() => {
      ElMessage.success("删除成功");
      form.fileName = "";
      form.fileUrl = "";
      fileList.value = []; // 清空文件列表
    });
  });
};

// 重置表单数据
const resetForm = () => {
  idCounter = 1;
  Object.assign(form, {
    id: undefined,
    realName: "", // 姓名
    positionName: "", // 职位
    workSummary: "", // 工作总结
    startTime: "", // 开始时间
    remark: "", // 备注
    reportDailyBS: [
      // 日报明细
      {
        id: idCounter++,
        plannedEndTime: "", // 计划结束时间
        status: 0, // 状态
        deadlineTime: "", // 截止时间
        workObjective: "", // 工作目标
        workContent: "", // 工作内容
      },
    ],
    fileName: "",
    fileUrl: "",
  });
};
</script>

<style scoped>
/* 使用 ::v-deep 确保穿透 scoped 样式 */
:deep(.file-upload .el-upload-list__item) {
  width: 400px !important; /* 强制应用样式 */
}
</style>
