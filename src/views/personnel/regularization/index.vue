<template>
  <div>
    <div class="custom-style">
      <el-segmented v-model="value" :options="options" @change="fetchVal" />
    </div>
    <div class="divder"></div>
    <div class="myApplication">
      <el-table
        :data="tableData"
        style="width: 100%"
        height="650"
        @row-click="handleRowClick"
        :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
        :row-style="{ height: '61px' }"
      >
        <el-table-column prop="processDefinitionName" label="审批类型" />
        <el-table-column prop="startUser.name" label="发起人" />
        <el-table-column prop="currentActivityName" label="当前节点" />
        <el-table-column prop="startTime" label="提交时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="businessStatus" label="审批状态">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.businessStatus == 1
                  ? 'primary'
                  : scope.row.businessStatus == 2
                    ? 'info'
                    : scope.row.businessStatus == 3
                      ? 'danger'
                      : 'success'
              "
              disable-transitions
              >{{
                scope.row.businessStatus == 1
                  ? "审批进行中"
                  : scope.row.businessStatus == 2
                    ? "审批被撤回"
                    : scope.row.businessStatus == 3
                      ? "审批被驳回"
                      : "审批通过"
              }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="duration"
          label="耗时"
          v-if="nodeVal !== '待我处理'"
        >
          <template #default="scope">
            <span>{{ formatDuration(scope.row.duration) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="pageQuery.pageNum"
        v-model:limit="pageQuery.pageSize"
        @pagination="fetchData"
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
        :currentValue="value"
      />
    </div>
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
  processType: "ZZ",
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
// 按钮操作完之后刷新列表
const handleProcessCompleted = (data) => {
  // 重新获取数据
  fetchData();
};

// 监听 segmented 值变化并调用 fetchData 获取新数据
const fetchVal = (newValue) => {
  nodeVal.value = newValue;
  pageQuery.pageNum = 1;
  // 重新获取数据
  fetchData();
};
// 默认处于
const value = ref("待我处理");
// 当前处于
const nodeVal = ref(null);

const options = ["待我处理", "已处理的", "抄送我的"];
// 根据当前选中的 segmented 值来调用对应的 API
const fetchData = () => {
  switch (value.value) {
    case "待我处理":
      fetchList("getFinanceToDoList");
      break;
    case "已处理的":
      fetchList("getFinanceDoneList");
      break;
    case "抄送我的":
      fetchList("getFinanceCcList");
      break;
  }
};

// 通用的 API 调用方法
const fetchList = (apiMethod) => {
  OrgAPI[apiMethod](pageQuery).then((res) => {
    tableData.length = 0;
    tableData.push(...res.list);
    total.value = res.total;
    if (res.list.length > 0) {
      const firstItem = res.list[0];
      processInstanceId.value = firstItem.processInstanceId || "";
      taskId.value = firstItem.taskId || "";
      nodeId.value = firstItem.nodeId || "";
      processDefinitionName.value = firstItem.processDefinitionName || "";
      businessStatus.value = firstItem.businessStatus || "";
    }
  });
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
  fetchData();
});
</script>
<style scoped lang="scss">
.myApplication {
  padding: 20px;
}

.custom-style {
  padding: 10px 20px;
  margin: 5px;
  border-radius: 8px;
}

.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #d6dbe4;
  --el-border-radius-base: 16px;
}

.divder {
  height: 1px;
  margin: 0 20px;
  border-bottom: 1px solid #ccc;
}
</style>
