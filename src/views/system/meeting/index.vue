<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNewReportDrawer"
        ><i-ep-plus />会议纪要</el-button
      >
      <div class="search">
        <el-input
          v-model="pageQuery.keywords"
          placeholder="请输入会议主题"
          class="s_input"
        />
        <!-- <el-input
          v-model="pageQuery.keywords"
          placeholder="请输入会议主持人"
          class="s_input"
        />
        <el-date-picker
          v-model="pageQuery.startTime"
          type="date"
          placeholder="会议日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        /> -->
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
        <el-table-column fixed label="会议日期">
          <template #default="{ row }">
            {{ formatTime(row.meetingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="meetingSubject" label="会议主题" />
        <el-table-column prop="deptName" label="主办部门" />
        <el-table-column prop="hostName" label="主持人" />
        <el-table-column prop="recorderName" label="记录人" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="openReportDetails(scope.row)"
            >
              <i-ep-link /> 查看
            </el-button>
            <el-button type="primary" link @click="editMeeting(scope.row)">
              <i-ep-edit />编辑
            </el-button>
            <el-button type="primary" link @click="delMeeting(scope.row)">
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
      <!-- 新建抽屉  submitSuccess监听新建汇报提交成功事件-->
      <MeetingDrawer
        v-model="isDrawerVisible"
        @submit-success="findAll"
        :data="selectedReportData"
      />

      <!-- 详情抽屉，传递选中的数据 -->
      <MeetingDetails v-model="isDrawerDetails" :data="selectedReportData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import MeetingAPI from "@/api/meeting";
import MeetingDrawer from "./components/MeetingDrawer.vue";
import MeetingDetails from "./components/MeetingDetails.vue";
import dayjs from "dayjs";

// 定义控制抽屉显示的状态
const isDrawerVisible = ref(false);
// 详情抽屉显示状态
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

// 当前选中的数据 （详情）
const selectedReportData = ref({});

// 打开抽屉
const openNewReportDrawer = () => {
  // 清空选中的数据
  selectedReportData.value = {};

  // 打开抽屉
  isDrawerVisible.value = true;
};

// 打开详情抽屉并设置选中的数据
const openReportDetails = async (scoped: any) => {
  const meetingId = scoped.id;
  try {
    // 调用接口获取详情数据
    const response = await MeetingAPI.detailsMeeting(meetingId);
    selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
    isDrawerDetails.value = true; // 打开详情抽屉
  } catch (error) {
    console.error("获取汇报详情失败:", error);
  }
};

// 编辑会议纪要
const editMeeting = async (scoped: any) => {
  const meetingId = scoped.id;
  // 调用接口获取详情数据
  const response = await MeetingAPI.detailsMeeting(meetingId);
  selectedReportData.value = response;

  isDrawerVisible.value = true; // 打开详情抽屉
};

// 删除会议纪要
const delMeeting = async (scoped: any) => {
  const id = scoped.id;
  try {
    await ElMessageBox.confirm("确定删除该会议纪要吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await MeetingAPI.delMeeting(id);
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
// 时间格式化
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 获取表格数据
const findAll = () => {
  MeetingAPI.meetingPage(pageQuery).then((res: any) => {
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
