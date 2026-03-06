<template>
  <div>
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
      class="pl5 mt5"
    >
      <el-row>
        <el-col :span="5">
          <el-form-item label="公告标题" prop="keywords">
            <el-input
              v-model="queryParams.keywords"
              placeholder="请输入公告标题"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="公告类型" prop="type">
            <Dict v-model="queryParams.type" code="notice" />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item>
            <el-button type="primary" @click="handleQuery"
              ><i-ep-search />搜索</el-button
            >
            <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-row :gutter="10" class="mb8 pl5">
      <el-col :span="1.5">
        <el-button
          type="primary"
          @click="handleAdd"
          v-hasPermi="['system:notice:add']"
          ><i-ep-plus />新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:notice:remove']"
          ><i-ep-delete />删除</el-button
        >
      </el-col>
    </el-row>

    <div class="listTab">
      <el-table
        v-loading="loading"
        :data="noticeList"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        height="650"
        :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
        :row-style="{ height: '61px' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" align="center" prop="id" width="100" />
        <el-table-column
          label="公告标题"
          align="center"
          prop="title"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          label="公告类型"
          align="center"
          prop="type"
          width="100"
        >
          <template #default="scope">
            <DictLabel v-model="scope.row.type" code="notice" />
          </template>
        </el-table-column>
        <el-table-column
          label="指定部门"
          align="center"
          prop="depName"
          width="100"
        >
          <!-- <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template> -->
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <DictLabel v-model="scope.row.status" code="notice_status" />
            <!-- <span>{{ scope.row.status === 1 ? "正常" : "禁用" }}</span> -->
          </template>
        </el-table-column>

        <el-table-column
          label="创建者"
          align="center"
          prop="createName"
          width="150"
        />
        <el-table-column label="创建时间" align="center" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="text"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:notice:edit']"
              ><i-ep-edit />修改</el-button
            >
            <el-button
              type="text"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:notice:remove']"
              ><i-ep-delete />删除</el-button
            >
            <el-button
              type="text"
              @click="handleDetail(scope.row)"
              v-hasPermi="['system:notice:view']"
              ><i-ep-link />查看</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination
      v-show="total > 0"
      v-model:total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加/修改/详情公告对话框 -->
    <el-dialog :title="title" v-model="open" width="780px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入公告标题"
                :disabled="mode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="type">
              <Dict
                v-model="form.type"
                code="notice"
                :disabled="mode === 'view'"
                placeholder="请选择公告类型"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="mode == 'view'">
            <el-form-item label="发布人" prop="createName">
              <el-input v-model="form.createName" :disabled="mode === 'view'" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="mode == 'view'">
            <el-form-item label="发布时间" prop="createTime">
              <el-input :value="formatTime(form.createTime)" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <Dict
                v-model="form.status"
                code="notice_status"
                :disabled="mode === 'view'"
                type="radio"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指定部门" prop="depId">
              <el-tree-select
                v-model="form.depId"
                placeholder="请选择部门"
                :data="deptList"
                filterable
                check-strictly
                :disabled="mode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <el-input
                type="textarea"
                v-model="form.content"
                :rows="10"
                placeholder="请输入内容"
                :disabled="mode === 'view'"
                :style="{ fontSize: '18px' }"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" v-if="mode !== 'view'"
            >确 定</el-button
          >
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";

import { ElMessage, FormInstance } from "element-plus"; // 引入 FormInstance 类型
import NoticeAPI from "@/api/notice";
import DeptAPI from "@/api/dept";
import { useNotificationStore } from "@/store";

const notificationStore = useNotificationStore();
const loading = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const noticeList = ref<any[]>([]);
const title = ref("");
const open = ref(false);
const formRef = ref<FormInstance | null>(null); // 新增的表单引用
const mode = ref("add"); // 模式：add, edit, view
const deptList = ref<OptionType[]>(); // 部门下拉列表

const queryParams = reactive({
  keywords: "",
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  createBy: undefined,
  type: "",
});
const form = reactive({
  id: undefined,
  title: undefined,
  type: "",
  status: "1",
  depId: "",
  content: "",
  createTime: "", // 确保初始化为 null 或其他有效的时间值
  createName: "",
});

// 时间格式化
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

const rules = {
  title: [{ required: true, message: "公告标题不能为空", trigger: "blur" }],
  type: [{ required: true, message: "公告类型不能为空", trigger: "change" }],
  depId: [{ required: true, message: "指定部门不能为空", trigger: "change" }],
};

const resetForm = (target: Record<string, any>) => {
  Object.keys(target).forEach((key) => {
    target[key] = undefined;
  });
  form.status = "1"; // 设置默认状态
};

// 取消按钮
const cancel = () => {
  open.value = false;
  // reset();
  resetForm(form);
};
// 重置表单
// const reset = () => {
//   Object.assign(form, {
//     noticeId: undefined,
//     noticeTitle: undefined,
//     noticeType: undefined,
//     noticeContent: undefined,
//     status: "0",
//   });
// };

// 获取公告列表
const getList = async () => {
  loading.value = true;
  await NoticeAPI.listNotice(queryParams).then((response: any) => {
    noticeList.value = response.list;
    total.value = response.total;
    loading.value = false;
  });
};

// 获取部门下拉选项
const getDeptOptions = async () => {
  const res = await DeptAPI.getOptions();
  deptList.value = res;
};

// 搜索按钮
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};
// 重置按钮
const resetQuery = () => {
  resetForm(queryParams);
  handleQuery();
};
// 处理选择变更
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};
// 新增公告
const handleAdd = () => {
  // reset();
  resetForm(form);
  open.value = true;
  title.value = "添加公告";
  mode.value = "add";
};
// 修改公告
const handleUpdate = async (row: any) => {
  // reset();
  resetForm(form);
  const noticeId = row.id;
  const response = await NoticeAPI.getNotice(noticeId);
  console.log("详情", response);
  Object.assign(form, response);
  console.log("详情", form);
  open.value = true;
  title.value = "修改公告";
  mode.value = "edit";
};

// 提交表单
const submitForm = async () => {
  // console.log("表单数据", form);
  try {
    const isValid = await formRef.value?.validate();
    if (isValid) {
      if (form.id !== undefined) {
        await NoticeAPI.updateNotice(form, form.id);
        ElMessage.success("修改成功");
      } else {
        await NoticeAPI.addNotice(form);
        ElMessage.success("新增成功");

        // 更新 lastUpdated，触发订阅者获取最新数据
        notificationStore.updateLastUpdated();
      }
      open.value = false;
      getList();
    }
  } catch (error) {
    console.error("表单验证失败：", error);
  }
};

// 删除公告
const handleDelete = async (row: any) => {
  const noticeIds = row.id || ids.value;
  ElMessageBox.confirm(
    '是否确认删除公告编号为"' + noticeIds + '"的数据项？',
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    await NoticeAPI.delNotice(noticeIds);
    ElMessage.success("删除成功");
    getList();
    // 更新 lastUpdated，触发订阅者获取最新数据
    notificationStore.updateLastUpdated();
  });
};
// 详情
const handleDetail = async (row: any) => {
  const noticeId = row.id;
  const response = await NoticeAPI.getNotice(noticeId);
  Object.assign(form, response);
  open.value = true;
  title.value = "公告详情";
  mode.value = "view";
};
// 生命周期钩子
onMounted(() => {
  getList();
  getDeptOptions();
});
</script>
<style scoped>
.el-form--inline .el-form-item {
  display: flex;
}

.listTab {
  padding: 10px;
  margin-top: -20px;
}
</style>
