<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNew"><i-ep-plus />新建</el-button>
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
            v-model="pageQuery.userName"
            placeholder="请输入被考核人名称"
            @click="openOrgPicker('被考核人')"
          />
        </div>
        <!-- <div style="width: 200px; margin-right: 15px">
          <el-date-picker
            v-model="pageQuery.reportCycle"
            type="date"
            placeholder="考核周期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div> -->

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
        <el-table-column fixed prop="userName" label="被考核人" />
        <el-table-column label="考核周期">
          <template #default="scope">
            {{ formatTime(scope.row.assessmentDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总分" />
        <el-table-column prop="achievementRate" label="达成率" />

        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="openReportDetails(scope.row)"
            >
              <i-ep-link /> 查看
            </el-button>
            <el-button type="primary" link @click="upd(scope.row)">
              <i-ep-edit />编辑
            </el-button>
            <el-button type="primary" link @click="del(scope.row)">
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
      <!-- 新建抽屉  submitSuccess 监听新建提交成功事件-->
      <PerformanceDrawer
        v-model="isDrawerVisible"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <!-- 详情抽屉，传递选中的数据 -->
      <PerformanceDetails
        v-model="isDrawerDetails"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <w-org-picker
        ref="orgPicker"
        :selected="selectedOrg"
        :multiple="multiple"
        type="user"
        @ok="selectOk"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import DailyAPI from "@/api/daily";
import PerformanceAPI from "@/api/performance";
import DeptAPI from "@/api/dept";
import PerformanceDrawer from "./components/PerformanceDrawer.vue";
import PerformanceDetails from "./components/PerformanceDetails.vue";
import WOrgPicker from "../../wflow/common/WOrgPicker.vue";

import dayjs from "dayjs";
const deptList = ref<OptionType[]>(); // 部门列表

const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM");
};

// 控制组织架构选择器
const orgPicker = ref();
const orgPickerTitle = ref("");
const selectedOrg = ref<User[]>([]);
const multiple = ref(false);

// 打开组织架构选择器
const openOrgPicker = (title: string) => {
  orgPickerTitle.value = title;
  orgPicker.value?.open();
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
  pageQuery.userId = selectedOrg.value[0]?.id;
  pageQuery.userName = selectedOrg.value[0]?.name;
  orgPicker.value?.close();
};

// 定义控制新建抽屉显示的状态
const isDrawerVisible = ref(false);
// 详情抽屉显示状态
const isDrawerDetails = ref(false);

const tableData = ref([]);
const pageQuery = reactive({
  userId: "",
  deptId: "",
  userName: "",
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

// 当前选中的数据 （详情）
const selectedReportData = ref({});

// 打开新建抽屉
const openNew = () => {
  // 清空选中的数据
  selectedReportData.value = {};
  // 打开新建抽屉
  isDrawerVisible.value = true;
};

// 打开汇报详情抽屉并设置选中的汇报数据
const openReportDetails = async (scoped: any) => {
  const reportId = scoped.id;
  try {
    // 调用接口获取详情数据
    const response = await PerformanceAPI.detailsPerformance(reportId);
    console.log("获取的详情数据:", response);
    if (response) {
      selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
      isDrawerDetails.value = true; // 打开详情抽屉
    } else {
      ElMessage.error("获取详情失败，数据为空");
    }
  } catch (error) {
    console.error("获取详情失败:", error);
  }
};

// 编辑
const upd = async (scoped: any) => {
  const Id = scoped.id;
  // 调用接口获取详情数据
  const response = await PerformanceAPI.detailsPerformance(Id);

  selectedReportData.value = response;
  isDrawerVisible.value = true; // 打开详情抽屉
};

// 删除
const del = async (scoped: any) => {
  const id = scoped.id;
  try {
    await ElMessageBox.confirm("确定删除吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await PerformanceAPI.delPerformance(id);
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
  pageQuery.userId = "";
  pageQuery.deptId = "";
  pageQuery.userName = "";
  findAll();
};

// 获取表格数据
const findAll = async () => {
  try {
    const res: any = await PerformanceAPI.performancePage(pageQuery);
    tableData.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error("获取表格数据失败:", error);
  }
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
