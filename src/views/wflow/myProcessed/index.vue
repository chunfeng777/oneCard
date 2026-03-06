<template>
  <div class="myApplication">
    <el-table
      :data="tableData"
      style="width: 100%"
      height="650"
      @row-click="handleRowClick"
      :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
      :row-style="{ height: '61px' }"
    >
      <el-table-column
        prop="processDefinitionName"
        label="审批类型"
        class="columnBox"
      />
      <el-table-column prop="startUser.name" label="发起人" />
      <el-table-column prop="currentActivityName" label="当前节点" />
      <el-table-column prop="startTime" label="提交时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column prop="duration" label="处理耗时">
        <template #default="scope">
          <span>{{ formatDuration(scope.row.duration) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="sizes ,prev, pager, next"
      :total="total"
      class="mt-4"
      :page-sizes="[10, 20, 50]"
      :page-size="pageQuery.pageSize"
      :current-page="pageNum"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <WDrawer
      :isDrawerOpen="isDrawerOpen"
      @update:drawer="isDrawerOpen = $event"
      :processInstanceId="processInstanceId"
      :taskId="taskId"
      :nodeId="nodeId"
      :processDefinitionName="processDefinitionName"
      :businessStatus="businessStatus"
      :startUser="startUser"
      :lastPart="lastPart"
      @process-completed="handleProcessCompleted"
    />
  </div>
</template>
<script setup>
import OrgAPI from "@/api/org";
import WDrawer from "@/views/wflow/common/WDrawer.vue";

const tableData = reactive([]);
const total = ref();
const pageQuery = reactive({
  pageNum: 1,
  pageSize: 10,
});
const isDrawerOpen = ref(false);

const processInstanceId = ref("");
const taskId = ref("");
const nodeId = ref("");
const processDefinitionName = ref("");
const businessStatus = ref("");
const startUser = ref("");
// 获取当前页面的url
const currentUrl = ref(window.location.href);
// 从 URL 中提取 hash 部分
const hash = new URL(currentUrl.value).hash;
// 移除开头的 `#` 并分割成数组
const parts = hash.slice(1).split("/");
// 获取最后一个部分
const lastPart = parts.pop();
// 改变每页显示条数
const handleSizeChange = (val) => {
  pageQuery.pageSize = val;
  postApplyList();
};

// 页码改变
const handleCurrentChange = (val) => {
  pageQuery.pageNum = val;
  postApplyList();
};

// 按钮操作完之后刷新列表
const handleProcessCompleted = (data) => {
  // 重新获取数据
  postApplyList();
};

// 点击表格行
const handleRowClick = (row, column, event) => {
  processInstanceId.value = row.processInstanceId || "";
  taskId.value = row.taskId || "";
  nodeId.value = row.nodeId || "";
  processDefinitionName.value = row.processDefinitionName || "";
  businessStatus.value = row.businessStatus || "";
  startUser.value = row.startUser || "";
  isDrawerOpen.value = !isDrawerOpen.value;
};

const postApplyList = () => {
  OrgAPI.postDoneList(pageQuery).then((res) => {
    // 清空现有数组
    tableData.length = 0;
    // 使用 push 添加新数据
    tableData.push(...res.list);
    total.value = res.total;
  });
};

// 格式化已耗时
const formatDuration = (duration) => {
  // 如果 duration 为 0 或者是负数，会返回 "N/A"
  if (!duration || duration < 0) return "N/A";

  // 将毫秒转换为秒
  const seconds = Math.floor(duration / 1000);

  // 计算年数
  const years = Math.floor(seconds / (365 * 24 * 60 * 60));
  // 计算剩余秒数
  let remainingSeconds = seconds % (365 * 24 * 60 * 60);

  // 计算月数（剩余天数除以平均每月天数）
  const months = Math.floor(remainingSeconds / (30 * 24 * 60 * 60));
  // 计算剩余秒数
  remainingSeconds %= 30 * 24 * 60 * 60;

  // 计算天数（剩余天数）
  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  // 计算剩余秒数
  remainingSeconds %= 24 * 60 * 60;

  // 计算小时数（剩余小时数）
  const hours = Math.floor(remainingSeconds / 3600);
  // 计算剩余秒数
  remainingSeconds %= 3600;

  // 计算分钟数（剩余分钟数）
  const minutes = Math.floor(remainingSeconds / 60);
  // 计算剩余秒数
  const finalSeconds = remainingSeconds % 60;

  // 如果年数大于 0，则显示年、月、天、小时、分钟和秒
  if (years > 0) {
    return `${years}年${months}月${days}天${hours}小时${minutes}分钟${finalSeconds}秒`;
  }
  // 如果月数大于 0，则显示月、天、小时、分钟和秒
  else if (months > 0) {
    return `${months}月${days}天${hours}小时${minutes}分钟${finalSeconds}秒`;
  }
  // 如果天数大于 0，则显示天、小时、分钟和秒
  else if (days > 0) {
    return `${days}天${hours}小时${minutes}分钟${finalSeconds}秒`;
  }
  // 如果小时数大于 0，则显示小时、分钟和秒
  else if (hours > 0) {
    return `${hours}小时${minutes}分钟${finalSeconds}秒`;
  }
  // 如果分钟数大于 0，则显示分钟和秒
  else if (minutes > 0) {
    return `${minutes}分钟${finalSeconds}秒`;
  }
  // 如果秒数大于 0，则显示秒
  else {
    return `${finalSeconds}秒`;
  }
};

onMounted(() => {
  postApplyList();
});
</script>
<style scoped lang="scss">
.myApplication {
  padding: 20px;
}
</style>
