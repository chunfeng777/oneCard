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
        <el-col :span="6">
          <el-form-item label="通知日期" prop="startTime" label-width="100">
            <el-date-picker
              v-model="queryParams.startTime"
              type="datetime"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="汇报类型" prop="type">
            <Dict v-model="queryParams.type" code="report" />
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
          label="通知标题"
          align="center"
          prop="title"
          :show-overflow-tooltip="true"
        />
        <el-table-column label="类型" align="center" prop="type" width="150">
          <template #default="scope">
            <DictLabel v-model="scope.row.type" code="report" />
          </template>
        </el-table-column>

        <el-table-column label="通知时间" align="center" width="200">
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

    <!-- 详情组件 -->
    <ReportDetailDialog
      :model-value="openReport"
      :id="selectedReport"
      @update:model-value="openReport = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";

import ReportDetailDialog from "@/views/dashboard/components/ReportDetailDialog.vue";
import ReportAPI from "@/api/report";

const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const noticeList = ref<any[]>([]);
const openReport = ref(false);
const selectedReport = ref<number>();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  startTime: "",
  type: "",
});

// 时间格式化
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 获取公告列表
const getList = async () => {
  loading.value = true;
  await ReportAPI.getReportNotices(queryParams).then((response) => {
    console.log(response);
    noticeList.value = response.list;
    total.value = response.total;
    loading.value = false;
  });
};

// 搜索按钮
const handleQuery = () => {
  queryParams.pageNum = 1;
  console.log(queryParams);

  getList();
};
// 重置按钮
const resetQuery = () => {
  queryParams.startTime = "";
  queryParams.type = "";
  queryParams.pageNum = 1;
  handleQuery();
};
const handleDetail = (row: any) => {
  selectedReport.value = row.id;
  openReport.value = true;
};
// 生命周期钩子
onMounted(() => {
  getList();
  // getDeptOptions();
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
