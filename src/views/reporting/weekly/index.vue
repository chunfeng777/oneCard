<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNewReportDrawer"
        ><i-ep-plus />新建汇报</el-button
      >
      <div class="search">
        <el-input
          v-model="pageQuery.keywords"
          placeholder="请输入汇报人名称"
          class="s_input"
        />
        <el-date-picker
          v-model="pageQuery.startTime"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-date-picker
          v-model="pageQuery.endTime"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="searchReports"
          ><i-ep-search />搜索</el-button
        >
        <el-button @click="handleAll" type="primary"
          ><i-ep-Refresh />重置</el-button
        >
      </div>
    </div>
    <div class="workList">
      <el-table
        :data="tableData"
        style="width: 100%"
        height="650"
        :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
        :row-style="{ height: '61px' }"
      >
        <el-table-column fixed prop="realName" label="汇报人" />
        <el-table-column prop="positionName" label="职位" />
        <el-table-column prop="reportCycle" label="汇报时间" />
        <el-table-column label="审核状态" prop="reviewStatus">
          <template #default="scope">
            <el-tag :type="scope.row.reviewStatus == 1 ? 'success' : 'info'">{{
              scope.row.reviewStatus == 1 ? "审核通过" : "未审核"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="openReportDetails(scope.row)"
            >
              <i-ep-link /> 查看
            </el-button>
            <el-button type="primary" link @click="editReport(scope.row)">
              <i-ep-edit />编辑
            </el-button>
            <el-button type="primary" link @click="delReport(scope.row)">
              <i-ep-delete />删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="pageQuery.pageNum"
        v-model:limit="pageQuery.pageSize"
        @pagination="findAll"
      />
      <!-- 新建汇报抽屉  submitSuccess监听新建汇报提交成功事件-->
      <ReportDrawer
        v-model="isDrawerVisible"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <!-- 汇报详情抽屉，传递选中的报告数据 -->
      <ReportDetails
        v-model="isDrawerDetails"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ReportAPI from "@/api/report";
import ReportDrawer from "./components/reportDrawer.vue";
import ReportDetails from "./components/ReportDetails.vue";

// 定义控制新建汇报抽屉显示的状态
const isDrawerVisible = ref(false);
// 周报详情抽屉显示状态
const isDrawerDetails = ref(false);

const tableData = ref([]);
const pageQuery = reactive({
  keywords: "",
  startTime: "",
  endTime: "",
  pageNum: 1,
  pageSize: 10,
});
const total = ref();

// 当前选中的汇报数据 （详情）
const selectedReportData = ref({});

// 打开新建汇报抽屉
const openNewReportDrawer = () => {
  // 清空选中的汇报数据
  selectedReportData.value = {};

  // 打开新建汇报抽屉
  isDrawerVisible.value = true;
};

// 打开汇报详情抽屉并设置选中的汇报数据
const openReportDetails = async (scoped: any) => {
  const reportId = scoped.id;
  try {
    // 调用接口获取详情数据
    const response = await ReportAPI.detailsWeeks(reportId);
    selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
    isDrawerDetails.value = true; // 打开详情抽屉
  } catch (error) {
    console.error("获取汇报详情失败:", error);
  }
};

// 编辑周报
const editReport = async (scoped: any) => {
  const reportId = scoped.id;
  try {
    // 调用接口获取详情数据
    const response = await ReportAPI.detailsWeeks(reportId);

    const reportData = response.data || response;

    if (reportData.reportCycle) {
      // 处理 reportCycle 字段
      const [startDate, endDate] = reportData.reportCycle.split(" ~ ");
      // 处理 reportWeekBList 的 isComplete 字段
      const reportWeekBList = reportData.reportWeekBList.map((item: any) => ({
        ...item,
        isComplete: item.isComplete === 1 ? "已完成" : "未完成",
      }));

      selectedReportData.value = {
        ...reportData,
        reportCycle: [startDate, endDate],
        reportWeekBList, // 使用转换后的 reportWeekBList
      };

      isDrawerVisible.value = true; // 打开详情抽屉
    } else {
      console.error("reportCycle 不存在于响应数据中");
    }
  } catch (error) {
    console.error("获取汇报详情失败:", error);
  }
};

// 删除周报
const delReport = async (scoped: any) => {
  const id = scoped.id;
  try {
    await ElMessageBox.confirm("确定删除该周报吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await ReportAPI.delWeeks(id);
    ElMessage.success("删除成功");
    await findAll();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败，请重试");
    }
  }
};

// 搜索
const searchReports = () => {
  pageQuery.pageNum = 1;
  findAll();
};

// 重置（清空所有数据）
const handleAll = () => {
  tableData.value = [];
  pageQuery.keywords = "";
  pageQuery.startTime = "";
  pageQuery.endTime = "";
  findAll();
};

// 获取表格数据
const findAll = () => {
  ReportAPI.weeksPage(pageQuery).then((res: any) => {
    tableData.value = res.list;
    total.value = res.total;
  });
};
onMounted(() => {
  findAll();
});
</script>
<style scoped>
.workBtn {
  display: flex;
  padding: 20px 0 0 20px;
}

.workList {
  padding: 20px;
}

.search {
  display: flex;
  gap: 10px;
  margin-left: 20px;
}

.s_input {
  width: 260px;
}

.s_data {
  width: 300px;
}
</style>
