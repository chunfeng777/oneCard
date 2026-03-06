<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNewReportDrawer"
        ><i-ep-plus />新建汇报</el-button
      >
      <div class="search">
        <div style="width: 200px">
          <el-tree-select
            v-model="pageQuery.deptId"
            placeholder="请选择部门"
            :data="deptList"
            filterable
            check-strictly
            class="s_select"
          />
        </div>
        <div style="width: 200px">
          <el-input
            v-model="pageQuery.keywords"
            placeholder="请输入汇报人名称"
          />
        </div>
        <div style="width: 200px; margin-right: 15px">
          <el-date-picker
            v-model="pageQuery.startTime"
            type="date"
            placeholder="开始时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>

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
        <el-table-column label="汇报时间">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间">
          <template #default="scope">
            {{ scope.row.startTime }}
          </template>
        </el-table-column>
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
            <el-button type="primary" link @click="editDaily(scope.row)">
              <i-ep-edit />编辑
            </el-button>
            <el-button type="primary" link @click="delDaily(scope.row)">
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
      <DailyDrawer
        v-model="isDrawerVisible"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <!-- 汇报详情抽屉，传递选中的报告数据 -->
      <DailyDetails
        v-model="isDrawerDetails"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import DailyAPI from "@/api/daily";
import DeptAPI from "@/api/dept";
import DailyDrawer from "./components/DailyDrawer.vue";
import DailyDetails from "./components/DailyDetails.vue";
import dayjs from "dayjs";
const deptList = ref<OptionType[]>(); // 部门列表

const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 定义控制新建汇报抽屉显示的状态
const isDrawerVisible = ref(false);
// 周报详情抽屉显示状态
const isDrawerDetails = ref(false);

const tableData = ref([]);
const pageQuery = reactive({
  keywords: "",
  deptId: "",
  startTime: "",
  pageNum: 1,
  pageSize: 10,
});
const total = ref();

// 获取部门下拉列表
const getDeptList = () => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
};

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
    const response = await DailyAPI.detailsDailys(reportId);
    console.log("获取的详情数据:", response); // 添加日志
    // selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
    // isDrawerDetails.value = true; // 打开详情抽屉
    if (response) {
      selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
      isDrawerDetails.value = true; // 打开详情抽屉
    } else {
      ElMessage.error("获取汇报详情失败，数据为空");
    }
  } catch (error) {
    console.error("获取汇报详情失败:", error);
  }
};

// 编辑日报
const editDaily = async (scoped: any) => {
  const Id = scoped.id;
  // 调用接口获取详情数据
  const response = await DailyAPI.detailsDailys(Id);

  selectedReportData.value = response;
  isDrawerVisible.value = true; // 打开详情抽屉
};

// 删除日报
const delDaily = async (scoped: any) => {
  const id = scoped.id;
  try {
    await ElMessageBox.confirm("确定删除该日报吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await DailyAPI.delDailys(id);
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
  pageQuery.deptId = "";
  pageQuery.startTime = "";
  findAll();
};

// 获取表格数据
const findAll = () => {
  DailyAPI.dailyPage(pageQuery).then((res: any) => {
    tableData.value = res.list;
    total.value = res.total;
  });
};
onMounted(() => {
  findAll();
  getDeptList();
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
  gap: 15px;
  align-items: center;
  margin-left: 20px;
}
</style>
