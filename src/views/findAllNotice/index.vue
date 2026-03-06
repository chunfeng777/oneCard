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

    <div class="listTab">
      <el-table
        v-loading="loading"
        :data="noticeList"
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
        />
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <span>{{ scope.row.status === 1 ? "正常" : "禁用" }}</span>
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

    <NoticeDetailDialog
      :model-value="open"
      :notice="selectedNotice"
      @update:model-value="open = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";

import NoticeAPI from "@/api/notice";
import DeptAPI from "@/api/dept";

const deptList = ref<OptionType[]>(); // 部门下拉列表

const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const noticeList = ref<any[]>([]);
const open = ref(false);
const selectedNotice = ref<number>();

const queryParams = reactive({
  keywords: "",
  pageNum: 1,
  pageSize: 10,
  type: "",
  title: undefined,
});

// 时间格式化
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 获取公告列表
const getList = async () => {
  loading.value = true;
  await NoticeAPI.findAllNotice(queryParams).then((response: any) => {
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
  queryParams.keywords = "";
  queryParams.type = "";
  queryParams.pageNum = 1;
  handleQuery();
};

const handleDetail = (row: any) => {
  selectedNotice.value = row.id;
  open.value = true;
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
